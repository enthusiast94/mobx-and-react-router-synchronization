import * as React from "react";
import { observable, reaction, action, runInAction } from "mobx";
import * as Router from "react-router-dom";
import { observer } from "mobx-react";
import DevTools from "mobx-react-devtools";

export class RootStore {
  @observable
  hash: string;

  @observable
  match: Router.match<any>;

  documentStore: DocumentStore;

  constructor() {
    this.documentStore = new DocumentStore(this);
  }

  @action
  public setRoute(hash: string, match: Router.match<any>) {
    this.hash = hash;
    this.match = match;
  }
}

export interface Document {
  id: string;
  name: string;
}

export interface AsyncResource<T> {
  value?: T;
  isLoading: boolean;
  error?: string;
}

export class DocumentStore {
  @observable
  documentsIds = ["one", "two", "three", "four", "five", "six"];

  @observable
  selectedDocument: AsyncResource<Document>;

  constructor(store: RootStore) {
    reaction(
      () => store.hash,
      () => {
        if (store.match.params.documentId) {
          if (
            this.selectedDocument &&
            this.selectedDocument.value &&
            this.selectedDocument.value.id === store.match.params.documentId
          ) {
            return;
          }

          this.loadDocument(store.match.params.documentId);
        }
      }
    );
  }

  @action
  loadDocument(documentId: string) {
    this.selectedDocument = { isLoading: true };
    setTimeout(
      () =>
        runInAction(() => {
          this.selectedDocument = {
            error: "hey",
            isLoading: false,
            value: {
              id: documentId,
              name: "Document " + documentId
            }
          };
        }),
      300
    );
  }
}

interface RouterWrapperProps {
  rootStore: RootStore;
}

export class RouterWrapper extends React.Component<
  RouterWrapperProps & Router.RouteComponentProps<any> & React.ReactNode,
  {}
> {
  constructor(props: any) {
    super(props);
    this.updateRoute();
  }

  componentDidUpdate(_: any, __: any) {
    this.updateRoute();
  }

  render() {
    return this.props.children;
  }

  private updateRoute() {
    this.props.rootStore.setRoute(
      this.props.location.pathname,
      this.props.match
    );
  }
}

const rootStore = new RootStore();

interface DocumentListProps {
  documentStore: DocumentStore;
}

@observer
export class DocumentList extends React.Component<DocumentListProps, {}> {
  render() {
    return (
      <div>
        <h2>Document List</h2>
        <ul>
          {this.props.documentStore.documentsIds.map(id => (
            <li key={id}>
              <Router.Link to={"/documents/" + id}>{id}</Router.Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

interface DocumentDetailProps {
  documentStore: DocumentStore;
}

@observer
export class DocumentDetail extends React.Component<DocumentDetailProps, {}> {
  render() {
    const store = this.props.documentStore;
    if (store.selectedDocument) {
      if (store.selectedDocument.isLoading) {
        return <div>Loading...</div>;
      } else if (store.selectedDocument.error) {
        return <div>{"Error: " + store.selectedDocument.error}</div>;
      } else if (store.selectedDocument.value) {
        return (
          <div>
            <h2>{store.selectedDocument.value.name}</h2>
            <Router.Link to="/documents">Back to list</Router.Link>
          </div>
        );
      }
    }

    return null;
  }
}

const styles = {
  root: {
    padding: "25px"
  }
};

export class App extends React.Component {
  public render() {
    return (
      <div style={styles.root}>
        <DevTools />
        <Router.Switch>
          <Router.Route
            path="/documents/:documentId"
            component={(props: Router.RouteComponentProps<any>) => (
              <RouterWrapper {...props} rootStore={rootStore}>
                <DocumentDetail documentStore={rootStore.documentStore} />
              </RouterWrapper>
            )}
          />
          <Router.Route
            path="/documents"
            component={(props: Router.RouteComponentProps<any>) => (
              <RouterWrapper {...props} rootStore={rootStore}>
                <DocumentList documentStore={rootStore.documentStore} />
              </RouterWrapper>
            )}
          />
          <Router.Redirect to={"/documents"} />
        </Router.Switch>
      </div>
    );
  }
}
