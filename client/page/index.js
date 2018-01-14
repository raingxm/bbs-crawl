import React from 'react';
import ReactDOM from 'react-dom';

import { Menu, Icon } from 'antd';
import Header from './components/header.js';
import MainContent from './components/main_content.js';

import './style/main.css';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;


class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Header/>
        <MainContent/>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));