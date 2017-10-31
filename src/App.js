/**
 * If you are going to learn ReactJS, YOU must know JSX.
 * create-react-app has already bootstrapped a boilerplate application.
 * All files come with default implementations.
 * The only file you will touch in the beginnig will be the src/App.js file.
 * here, There must App Component.If there is not App componet, Project have not run. 
 */

import React, { Component } from 'react';
import logo from './logo.svg';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
/**
 *  'Search' Component create.
 */
class Search extends Component {
  componentDidMount() {
    this.input.focus();
  }
  render() {
    const { value, onChange, onSubmit, children } = this.props;
    let input;
    return (
      <form onSubmit={onSubmit}>
        <input type="text" value={value} onChange={onChange} ref={(node) => { this.input = node; }} />
        <button type="submit">{children}</button>
      </form>
    );
  }
}
/**
 * 'Table' componet create.
 */
class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };
    this.onSort = this.onSort.bind(this);//sorting
  };
  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }
  render() {
    const { list, onDismiss } = this.props;
    const { sortKey, isSortReverse } = this.state;
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;
    return (
      <div className="table">
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort sortKey={'TITLE'} onSort={this.onSort} activeSortKey={sortKey}>Title
        </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort sortKey={'AUTHOR'} onSort={this.onSort} activeSortKey={sortKey}> Author</Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort sortKey={'COMMENTS'} onSort={this.onSort} activeSortKey={sortKey}>Comments</Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort sortKey={'POINTS'} onSort={this.onSort} activeSortKey={sortKey} activeSortKey={sortKey}>Points</Sort>
          </span>
          <span style={{ width: '10%' }}>Archive</span>
        </div>
        {reverseSortedList.map(item =>
          <div key={item.objectID} className="table-row">
            <span style={{ width: '40%' }}> <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>{item.author}</span>
            <span style={{ width: '10%' }}>{item.num_comments}</span>
            <span style={{ width: '10%' }}>{item.points}</span>
            <span style={{ width: '10%' }}>
              <button onClick={() => onDismiss(item.objectID)} type="button" className="button-inline">Dismiss</button>
            </span>
          </div>
        )}
      </div>
    );
  }
}
Table.PropTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};
const Button = ({ onClick, className, children }) =>
  <button onClick={onClick} className={className} type="button">{children}</button>
Button.PropTypes = {
  onclick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
Button.defaultProps = {
  className: '',
};
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};
const Sort = ({ sortKey, activeSortKey, onSort, children }) => {
  const sortClass = classNames('button-inline',
    { 'button-active': sortKey === activeSortKey }
  );
  return (
    <Button onClick={() => onSort(sortKey)} className={sortClass}>
      {children}
    </Button>
  );
}
const Loading = () =>
  <div>Loading ...</div>
const withLoading = (Component) => ({ isLoading, ...rest }) =>
  isLoading ? <Loading /> : <Component { ...rest } />
const ButtonWithLoading = withLoading(Button);


class App extends Component {//App Componet declaration.
  constructor(props) {// componet initialize.
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      isLoading: false,
      sortKey: 'NONE',
      isSortReverse: false,
    };
    this.setSearchTopstories = this.setSearchTopstories.bind(this);
    this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);

  }
  setSearchTopstories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }
      },
      isLoading: false
    });
  }
  fetchSearchTopstories(searchTerm) {
    this.setState({ isLoading: true });
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json()).then(result => this.setSearchTopstories(result)).catch(e => e);
  }
  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm);
  }
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm);
    }
    event.preventDefault();
  }
  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }
  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: { ...results, [searchKey]: { hits: updatedHits, page } }
    });
  }

  onSearchChange(event) { //input tag event declear.
    this.setState({ searchTerm: event.target.value });
  }
  render() {// return the element(Element are what components are made of)such as HTML.
    const { searchTerm, results, searchKey, isLoading } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search value={searchTerm} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>Search</Search>
        </div>
        <Table list={list} onDismiss={this.onDismiss} />
        <div className="interactions">
          <ButtonWithLoading isLoading={isLoading}
            onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>More
          </ButtonWithLoading>
        </div>
      </div>
    );

  }
}

export default App;
export {
  Button,
  Search,
  Table,
};