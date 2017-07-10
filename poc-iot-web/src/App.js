import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import Badge from 'material-ui/Badge';

let socket;

const styles = {
  block: {
    maxWidth: 250,
    margin: '0 auto'
  },
  toggle: {
    marginBottom: 16,
  }
};

class App extends Component {
  
  constructor(props) {
    super(props)
    this.state = {btnState: 'offline', aps: [], discovery: [], place: 'place1', mode: 0}
  }

  componentDidMount() {
    socket = io.connect()
    socket.on('button', btnState => this.setState({btnState: btnState || 'offline'}))
    socket.on('fillList', res => {
      this.setState({aps: res})
    })
    socket.on('aps', aps => {
      this.setState({aps: [...this.state.aps, aps] || []})
    });
    socket.on('discovery', discovery => {
      console.log(discovery)
      this.setState({discovery: [...this.state.discovery, discovery] || []})
    })
    socket.on('place', place => this.setState({place: place || 'place1'}))
    socket.on('mode', mode => this.setState({mode: mode || 'mapping'}))
  }

  handleChange = (event) => {
    this.setState({place: event.target.value})
  }

  handleClick = (event) => {
    socket.emit('change_place', this.state.place);
  }

  handleToggle = (event, isInputChecked) => {
    socket.emit('toggle_mode', isInputChecked ? "1" : "0");
  }

  render() {
    let {btnState, aps, discovery, place, mode} = this.state
    return (
      <div className="App">
        <div className="App-header">
          <h2>Indoor location with KNN</h2>
        </div>
        <section>
          <TextField 
            id="txtPlace"
            value={place}
            onChange={this.handleChange}
          />
          <FlatButton label="Apply" primary={true} onClick={this.handleClick} />
          <br/>
          <Toggle
            label="Enable Discovery Mode"
            style={styles.block}
            onToggle={this.handleToggle}
          />
          <br/>
          <span>Button State: {btnState}</span>
          <br/> <br/>
          <section>
            <h2>
               <Badge
                  badgeContent={this.state.discovery.length}
                  primary={true}
                >
                  Discovery
                </Badge>
            </h2>
            <List>
              {discovery && discovery.map((item, idx) => {
                if (typeof item === 'object') {
                  return (
                    <ListItem key={idx} primaryText={`${item.label}-${JSON.stringify(item.rss_values)}`} rightIcon={<ContentInbox />} />
                  )
                } else {
                  return (
                    <ListItem key={idx} primaryText={item} rightIcon={<ContentInbox />} />
                  )
                }
              }) 
              }
            </List>
            <Divider />
            <h2>
               <Badge
                  badgeContent={this.state.aps.length}
                  secondary={true}
                >
                  RSS values
                </Badge>
            </h2>
            <List>
              {aps && aps.map((item, idx) => {
                if (typeof item === 'object') {
                  return (
                    <ListItem key={idx} primaryText={`${item.place}-${JSON.stringify(item.rss_values)}`} rightIcon={<ContentInbox />} />
                  )
                } else {
                  return (
                    <ListItem key={idx} primaryText={item} rightIcon={<ContentInbox />} />
                  )
                }
              }) 
              }
            </List>

          </section>
          


          
        </section>
      </div>
    );
  }
}

export default App;
