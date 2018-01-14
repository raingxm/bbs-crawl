import React from 'react';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="header">
        <div className="title">找呀找呀找朋友, 找到一个好朋友</div>
      </div>
    )
  }
}