import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import * as ReactBootStrap from 'react-bootstrap';
import axios from 'axios';


const costs = [{description: "Economic shutdown", value: 7.5e12},
               {description: "Stimulus plan", value: 2.5e12}];

const benefits = [{description: "Lives saved from distancing", value: 7.5e12}];


class Cell extends React.Component {

  render() {
    return (
      <button className="cell">
        {this.props.value}
      </button>
    );
  }
}

class Button extends React.Component {
  render() {
    return (
      <button onClick={() => this.props.onClick()}>
      Toggle
      </button>
    )
  }
}


class MyDropdown extends React.Component {
    render() {
      return (
        <ReactBootStrap.DropdownButton id="dropdown-basic-button" title="Add">
          {this.props.items.map( (x) => <ReactBootStrap.Dropdown.Item as="button" onClick={() => this.props.onClick(x)}>{x["description"]}</ReactBootStrap.Dropdown.Item>)}
        </ReactBootStrap.DropdownButton>
      );
    }
}


class MyTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {rows: [], foobar: ""};
  }

  toggleHidden() {
    this.setState({tableHidden: !this.state.tableHidden})
  }

  renderRow(data, index, col_names) {
    //console.log(col_names);
    return (
      <tr key={index}>
        {col_names.map( (c) => <td key={index.toString() + c}>{data[c]}</td>)}
      </tr>
    );
  }

  renderButton() {
    return (
      <Button onClick={() => this.toggleHidden()}/>
    );
  }

  addRow(val) {
    this.props.updateFunc(val["value"]);
    this.setState({rows: this.state.rows.concat(val)});
  }

  adjValue(val) {
    return val / 1e12;
  }

  renderTable() {
    return (
      <ReactBootStrap.Table className="table1" striped bordered hover>
        <tbody>
          <tr>
            <td width="80%"><MyDropdown title={this.props.id} items={this.props.items} onClick={x => this.addRow(x)}/></td><td></td>
          </tr>
          {this.state.rows.map( (r) => <tr><td>{r["description"]}</td><td>{this.adjValue(r["value"])}</td></tr>)}
        </tbody>
      </ReactBootStrap.Table>
    )
  }

  render() {

    return (
      <div>
        {this.renderTable()}
      </div>
    );
  }
}

class CostBenefit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {net_benefit: 0}
  }

  updateFunc(val) {
    this.setState({net_benefit: this.state.net_benefit + val})
  }

  render() {
    return (
      <div>
        <center><h1>COVID-19 Cost Benefit</h1></center>
        <h3>Costs</h3>
        <MyTable id="costs" items={costs} updateFunc={x => this.updateFunc(-x)}/>

        <h3>Benefits</h3>
        <MyTable id="benefits" items={benefits} updateFunc={x => this.updateFunc(x)}/>

        <h3>Net Benefit: {this.state.net_benefit / 1e12} Trillon Dollars</h3>
      </div>
    );
  }
}


ReactDOM.render(
  <CostBenefit/>,
  document.getElementById('root')
);
