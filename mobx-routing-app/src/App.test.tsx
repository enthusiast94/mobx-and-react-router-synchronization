import * as React from "react";
import {
  App,
  DocumentList,
  DocumentDetail,
  RouterWrapper,
  RootStore
} from "./App";
import { mount } from "enzyme";
import * as Router from "react-router-dom";

describe("<App />", () => {
  describe("routing", () => {
    it("/documents should render DocumentList ", () => {
      const wrapper = mount(
        <Router.MemoryRouter initialEntries={["/documents"]}>
          <App />
        </Router.MemoryRouter>
      );
      const routerSwitch = wrapper.find(Router.Switch);
      expect(routerSwitch).toHaveLength(1);
      const documentList = routerSwitch.find(DocumentList);
      expect(documentList).toHaveLength(1);
    });

    it("/documents/:id should render DocumentDetail ", () => {
      const wrapper = mount(
        <Router.MemoryRouter initialEntries={["/documents/1"]}>
          <App />
        </Router.MemoryRouter>
      );
      const routerSwitch = wrapper.find(Router.Switch);
      expect(routerSwitch).toHaveLength(1);
      const documentDetail = routerSwitch.find(DocumentDetail);
      expect(documentDetail).toHaveLength(1);
    });

    it("any other route should redirect to /documents ", () => {
      const wrapper = mount(
        <Router.MemoryRouter initialEntries={["/bla"]}>
          <App />
        </Router.MemoryRouter>
      );
      const routerWrapper = wrapper.find(RouterWrapper);
      expect(routerWrapper.props().location.pathname).toBe("/documents");
    });
  });
});

describe("<DocumentList />", () => {
  it("should render list of documents", () => {
    const rootStore = new RootStore();
    rootStore.documentStore.documentsIds = ["one", "two"];
    const wrapper = mount(
      <Router.MemoryRouter>
        <DocumentList documentStore={rootStore.documentStore} />
      </Router.MemoryRouter>
    );
    const links = wrapper.find(Router.Link);
    expect(links).toHaveLength(2);
    expect(links.at(0).text()).toBe("one");
    expect(links.at(1).text()).toBe("two");
  });
});

describe("<DocumentDetail />", () => {
  it("should show  loading text when document is loading", () => {
    const rootStore = new RootStore();
    rootStore.documentStore.selectedDocument = { isLoading: true };
    const wrapper = mount(
      <Router.MemoryRouter>
        <DocumentDetail documentStore={rootStore.documentStore} />
      </Router.MemoryRouter>
    );
    const loadingDiv = wrapper.find("div");
    expect(loadingDiv).toHaveLength(1);
    expect(loadingDiv.text()).toBe("Loading...");
  });

  it("should show  error text when document fails to load", () => {
    const rootStore = new RootStore();
    rootStore.documentStore.selectedDocument = {
      error: "failed to load document",
      isLoading: false
    };
    const wrapper = mount(
      <Router.MemoryRouter>
        <DocumentDetail documentStore={rootStore.documentStore} />
      </Router.MemoryRouter>
    );
    const errorDiv = wrapper.find("div");
    expect(errorDiv).toHaveLength(1);
    expect(errorDiv.text()).toBe("Error: failed to load document");
  });

  it('should render document details', () => {
    const rootStore = new RootStore();
    rootStore.documentStore.selectedDocument = {
      isLoading: false,
      value: {id: "1", name: "One"}
    };
    const wrapper = mount(
      <Router.MemoryRouter>
        <DocumentDetail documentStore={rootStore.documentStore} />
      </Router.MemoryRouter>
    );

    expect(wrapper.find("h2").text()).toBe("One");
    const backLink = wrapper.find(Router.Link);
    expect(backLink.text()).toBe("Back to list");
    expect(backLink.props().to).toBe("/documents");
  });
});

describe('DocumentStore', () => {
  it('should load document whenever documentId is in the active route', () => {
    const rootStore = new RootStore();
    rootStore.documentStore.loadDocument = jest.fn();
    const loadDocument: any = rootStore.documentStore.loadDocument;
    
    rootStore.match = {params: {documentId: "blaOne"}, isExact: false, path: "", url: ""}; 
    rootStore.hash = "";

    expect(loadDocument.mock.calls.length).toBe(1);
    expect(loadDocument.mock.calls[0][0]).toBe("blaOne");
  });
});
