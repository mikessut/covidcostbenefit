import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import * as ReactBootStrap from 'react-bootstrap';
import axios from 'axios';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';

const columns = [
  {
  dataField: 'description',
  text: 'Description'
  },
  {
    dataField: 'detailed_description',
    text: "Detailed Description"
  },
  {
    dataField: 'value',
    text: 'Value (Trillion USD)',
    headerStyle: (column, colIndex) => {
      return { width: '40px' };
    },
  },
  {
    dataField: 'rating',
    text: 'Rating',
    headerStyle: (column, colIndex) => {
      return { width: '40px' };
    }
  }
];

const scenarios = [
  {description: "Blank", costs: [], benefits: [], id:0},
  {description: "Extended Social Distancing", costs: [0, 1], benefits: [0], id: 1}]


class MyDropdown extends React.Component {
    render() {
      return (
        <ReactBootStrap.DropdownButton id="dropdown-basic-button" title="Add">
          {this.props.items.map( (x) => <ReactBootStrap.Dropdown.Item as="button" onClick={() => this.props.onClick(x)} key={x["id"]}>{x["description"]}</ReactBootStrap.Dropdown.Item>)}
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
    /*
    const tmp = [];
    scenarios[val][this.props.id].map(x => tmp.push(cost_and_benefits[this.props.id][x]));
    console.log(tmp);
    this.setState({rows: tmp});
    */
  }

  renderTable() {
    return (
      <ReactBootStrap.Table className="table1" striped bordered hover>
        <tbody>
          <tr>
            <td width="80%"><MyDropdown title={this.props.id} items={this.props.items} onClick={x => this.addRow(x)}/></td><td></td>
          </tr>
          {this.state.rows.map( (r) => <tr key={r["id"]}><td>{r["description"]}</td><td>{r["value"]}</td></tr>)}
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
    console.log(this.props);
    if (this.props.isLoading) {
      return null;
    } else {
    return (
      <div>
        <h3>Costs</h3>
        <MyTable id="costs" items={this.props.data['costs']} updateFunc={x => this.updateFunc(-x)} ref={this.cost_ref}/>

        <h3>Benefits</h3>
        <MyTable id="benefits" items={this.props.data['benefits']} updateFunc={x => this.updateFunc(x)} ref={this.benefit_ref}/>

        <h3>Net Benefit: {this.state.net_benefit} Trillon Dollars</h3>
      </div>
    );
  }
}
}


class ScenarioSelector extends React.Component {
    render() {
      return (
        <div  className="scenario_select">
        <ReactBootStrap.DropdownButton title="Select Scenario">
          {scenarios.map( (x) => <ReactBootStrap.Dropdown.Item as="button" onClick={() => this.props.onClick(x["id"])} key={x["id"]}>{x["description"]}</ReactBootStrap.Dropdown.Item>)}
        </ReactBootStrap.DropdownButton>
        </div>
      );
    }
}


class CostLibrary extends React.Component {
  render() {
    if (this.props.isLoading)
      return null;
    return (
      <div className="table1 spaceabove">
      <BootstrapTable keyField='id' pagination={paginationFactory()} striped hover data={this.props.data[this.props.type]} columns={columns}/>
      </div>
    );
  }
}


class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {scenario: null,
                  data: null,
                  isLoading: true};
    this.costbenefit_ref = React.createRef();
  }

  async componentDidMount() {
    axios.get('https://covidcostbenefit.com/api/v1/resources')
      .then(res => {
        //console.log(res.data);
          this.setState({ data: res.data });
          this.setState({isLoading: false});
        });
  }

  setScenario(id) {
    this.setState({scenario: id})
    this.costbenefit_ref.current.setScenario(id)
  }

  render() {
    console.log("page");
    console.log(this.state.data);
    return (
      <div>
      <center><h1>COVID-19 Cost Benefit</h1></center>
      <ScenarioSelector onClick={(x) => this.setScenario(x)}/>
      <CostBenefit ref={this.costbenefit_ref} data={this.state.data} isLoading={this.state.isLoading}/>

      <hr className='table1'/>
      <h3 className="largespaceabove">Library of Costs</h3>
      <CostLibrary data={this.state.data} type='costs' isLoading={this.state.isLoading}/>
      <hr className='table1'/>

      <h3 className="largespaceabove">Library of Benefits</h3>
      <CostLibrary data={this.state.data} type='benefits' isLoading={this.state.isLoading}/>
      </div>
    );
  }
}


ReactDOM.render(
  <Page/>,
  document.getElementById('root')
);
