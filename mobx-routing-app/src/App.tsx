import * as React from "react";
import { observable, reaction, action } from "mobx";
import * as Router from "react-router-dom";
import { observer } from "mobx-react";
import DevTools from 'mobx-react-devtools';

class RootStore {
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

interface Document {
  id: string;
  name: string;
}

class DocumentStore {
  @observable
  documentsIds = ["one", "two", "three", "four", "five", "six"];

  @observable
  selectedDocument: Document;

  constructor(store: RootStore) {
    reaction(
      () => store.hash,
      () => {
        if (store.match.params.documentId) {
          if (
            this.selectedDocument &&
            this.selectedDocument.id === store.match.params.documentId
          ) {
            return;
          }

          this.loadDocuent(store.match.params.documentId);
        }
      }
    );
  }

  @action
  loadDocuent(documentId: string) {
    this.selectedDocument = { id: documentId, name: "Document " + documentId };
  }
}

interface RouterWrapperProps {
  rootStore: RootStore;
}

class RouterWrapper extends React.Component<
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

@observer
class DocumentList extends React.Component {
  render() {
    return (
      <div>
        <h2>Document List</h2>
        <ul>
          {rootStore.documentStore.documentsIds.map(id => (
            <li key={id}>
              <Router.Link to={"/documents/" + id}>{id}</Router.Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

@observer
class DocumentDetail extends React.Component {
  render() {
    if (rootStore.documentStore.selectedDocument) {
      return (
        <div>
          <h2>{rootStore.documentStore.selectedDocument.name}</h2>
          <Router.Link to="/documents">Back to list</Router.Link>          
        </div>
      );
    } else {
      return null;
    }
  }
}

const styles = {
  root: {
    padding: "25px"
  }
};

class App extends React.Component {
  public render() {
    return (
      <div style={styles.root}>
        <DevTools />
        <Router.HashRouter>
          <Router.Switch>
            <Router.Route
              path="/documents/:documentId"
              component={(props: Router.RouteComponentProps<any>) => (
                <RouterWrapper {...props} rootStore={rootStore}>
                  <DocumentDetail />
                </RouterWrapper>
              )}
            />
            <Router.Route
              path="/documents"
              component={(props: Router.RouteComponentProps<any>) => (
                <RouterWrapper {...props} rootStore={rootStore}>
                  <DocumentList />
                </RouterWrapper>
              )}
            />
            <Router.Redirect to={"/documents"} />
          </Router.Switch>
        </Router.HashRouter>
      </div>
    );
  }
}

export default App;
