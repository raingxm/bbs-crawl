import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { Menu, Icon } from 'antd';
import Header from './components/header.js';
import MainContent from './components/main_content.js';

import './style/main.css';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;


class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    // return (
    //   // <div className="crawl">
    //   //   <Header/>
    //   //   <MainContent/>
    //   // </div>
    //   <div>haha</div>
    // );
    return null;
  }
}

ReactDOM.render(<div>test</div>, document.getElementById('root'));
