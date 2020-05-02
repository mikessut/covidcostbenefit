import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import * as ReactBootStrap from 'react-bootstrap';
import axios from 'axios';


const costs = [{description: "Economic shutdown", value: 7.5, id: 0},
               {description: "Stimulus plan", value: 2.5, id: 1}];

const benefits = [{description: "Lives saved from distancing", value: 7.5, id: 0}];

const cost_and_benefits = {costs: costs, benefits: benefits};

const scenarios = [{description: "Extended Social Distancing", costs: [0, 1], benefits: [0], id: 0}]


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
    this.state = {rows: []}
  }

  addRow(val) {
    this.props.updateFunc(val["value"]);
    this.setState({rows: this.state.rows.concat(val)});
  }

  setScenario(val) {
    const tmp = [];
    console.log(scenarios[val][this.props.id]);
    console.log(cost_and_benefits[this.props.id]);

    scenarios[val][this.props.id].map(x => tmp.push(cost_and_benefits[this.props.id][x]));
    console.log(tmp);
    this.setState({rows: tmp});
  }

  renderTable() {
    return (
      <ReactBootStrap.Table className="table1" striped bordered hover>
        <tbody>
          <tr>
            <td width="80%"><MyDropdown title={this.props.id} items={this.props.items} onClick={x => this.addRow(x)}/></td><td></td>
          </tr>
          {this.state.rows.map( (r) => <tr><td>{r["description"]}</td><td>{r["value"]}</td></tr>)}
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
    this.cost_ref = React.createRef();
    this.benefit_ref = React.createRef();
  }

  updateFunc(val) {
    this.setState({net_benefit: this.state.net_benefit + val})
  }

  setScenario(val) {
    this.cost_ref.current.setScenario(val);
    this.benefit_ref.current.setScenario(val);
    this.setState({net_benefit: 0});
  }

  render() {
    return (
      <div>
        <h3>Costs</h3>
        <MyTable id="costs" items={costs} scenario={this.props.scenario} updateFunc={x => this.updateFunc(-x)} ref={this.cost_ref}/>

        <h3>Benefits</h3>
        <MyTable id="benefits" items={benefits} scenario={this.props.scenario} updateFunc={x => this.updateFunc(x)} ref={this.benefit_ref}/>

        <h3>Net Benefit: {this.state.net_benefit} Trillon Dollars</h3>
      </div>
    );
  }
}


class ScenarioSelector extends React.Component {
    render() {
      return (
        <div  className="scenario_select">
        <ReactBootStrap.DropdownButton title="Select Scenario">
          {scenarios.map( (x) => <ReactBootStrap.Dropdown.Item as="button" onClick={() => this.props.onClick(x["id"])}>{x["description"]}</ReactBootStrap.Dropdown.Item>)}
        </ReactBootStrap.DropdownButton>
        </div>
      );
    }
}


class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {scenario: null};
    this.costbenefit_ref = React.createRef();
  }

  setScenario(id) {
    this.setState({scenario: id})
    this.costbenefit_ref.current.setScenario(id)
  }

  render() {
    return (
      <div>
      <center><h1>COVID-19 Cost Benefit</h1></center>
      <ScenarioSelector onClick={(x) => this.setScenario(x)}/>
      <CostBenefit scenario={this.state.scenario} ref={this.costbenefit_ref}/>
      </div>
    );
  }
}


ReactDOM.render(
  <Page/>,
  document.getElementById('root')
);
