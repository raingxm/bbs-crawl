import React from 'react';
import axios from 'axios';

import { Avatar, List, Input } from 'antd';
const Search = Input.Search;

export default class MainContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: []
    };
  }

  componentDidMount() {
    axios.get(`/search`).then((response)=> {
      if (response && response.data.status === 'success') {
        this.setState({
          articles: response.data.articles
        });
      }
    });
  }

  render() {
    return (
      <div style={{width: 800, margin: '0 auto'}}>
        <Search
          placeholder="input search text"
          onSearch={this.handleSearch.bind(this)}
          style={{ width: 600, margin: '10 auto' }}
        />

        <List
          itemLayout="horizontal"
          dataSource={this.state.articles}
          renderItem={item => (
            <div>
              <List.Item
                key={item._id}
              >
                <List.Item.Meta
                  avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                  title={<a href={item._id}>{item.title}---{item.date}</a>}
                  description={item.body.slice(0, 1000)}
                />
              </List.Item>
              {this.renderAritlceImageList(item)}
            </div>
          )}
        >

        </List>
      </div>

    )
  }

  renderAritlceImageList(article) {
    let articleImages = article.images.map((image, index) => {
      return <img key={index} width={272} src={image} />
    });

    return (
      <div style={{margin: '0 auto'}}>
        {articleImages}
      </div>
    );
  }

  handleSearch(value) {
    axios.get(`/search?keyword=${encodeURIComponent(value)}`).then((response)=> {
      if (response && response.data.status === 'success') {
        this.setState({
          articles: response.data.articles
        });
      }
    });
  }
}