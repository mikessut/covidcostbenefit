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

//const API_SITE = "http://localhost:5000/"
const API_SITE = "https://covidcostbenefit.com/"

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
    text: '$',
    headerStyle: (column, colIndex) => {
      return { width: '40px' };
    },
  },
  {
    dataField: 'votes',
    text: 'Votes',
    headerStyle: (column, colIndex) => {
      return { width: '80px' };
    },
    sort: true,
    events: {onClick: (e, column, columnIdx, row, rowIdx) => this.voteClick(column, columnIdx, row, rowIdx)},
    formatter: (cell, row) => {
      //console.log("formatter:", cell, row);
      return (
        <div>
        <div className="sameline">{cell}</div>
        <div className="sameline"><img src="like.png" width="32px"/></div>
        </div>
      );
    }

  }
];


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
    const tmp = [];
    this.props.data['scenarios'][val][this.props.type].map(x => {
      tmp.push(this.props.data[this.props.type][x]);
      //console.log("setScenario", this.props.data[this.props.type][x]);
      this.props.updateFunc(this.props.data[this.props.type][x]['value']);
    });

    //console.log(tmp);
    this.setState({rows: tmp});
  }

  renderTable() {
    return (
      <ReactBootStrap.Table className="table1" striped bordered hover>
        <tbody>
          <tr>
            <td width="80%"><MyDropdown title={this.props.id} items={this.props.data[this.props.type]} onClick={x => this.addRow(x)}/></td><td></td>
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
    this.state = {net_benefit: 0.0};
    this.cost_ref = React.createRef();
    this.benefit_ref = React.createRef();
  }

  updateFunc(val) {
    //Fconsole.log("costbenefitupdatefunc", val, this.state.net_benefit);
    this.setState(currentState => {
      currentState.net_benefit += val;
      return currentState;
    });
    //console.log("costbenefitupdatefunc2", this.state.net_benefit);
  }

  setScenario(val) {
    this.setState({net_benefit: 0.0});
    this.cost_ref.current.setScenario(val);
    this.benefit_ref.current.setScenario(val);
  }

  render() {
    //console.log(this.props);
    if (this.props.isLoading) {
      return null;
    } else {
    return (
      <div>
        <h3>Costs</h3>
        <MyTable type="costs" data={this.props.data} updateFunc={x => this.updateFunc(-x)} ref={this.cost_ref}/>

        <h3>Benefits</h3>
        <MyTable type="benefits" data={this.props.data} updateFunc={x => this.updateFunc(x)} ref={this.benefit_ref}/>

        <h3>Net Benefit: {this.state.net_benefit.toFixed(3)} Trillon Dollars</h3>
      </div>
    );
  }
}
}


class ScenarioSelector extends React.Component {
    render() {
      if (this.props.isLoading)
        return null;
      return (
        <div  className="scenario_select">
        <ReactBootStrap.DropdownButton title="Select Scenario">
          {this.props.data['scenarios'].map( (x) => <ReactBootStrap.Dropdown.Item as="button" onClick={() => this.props.onClick(x["id"])} key={x["id"]}>{x["description"]}</ReactBootStrap.Dropdown.Item>)}
        </ReactBootStrap.DropdownButton>
        </div>
      );
    }
}


class CostLibrary extends React.Component {
  constructor(props) {
    super(props);
    this.columns = JSON.parse(JSON.stringify(columns));
    //console.log(this.props.type)
    //this.columns[3]['events']['onClick'] = this.voteClick.bind(this);
    this.columns[3]['formatter'] = (cell, row) => {
          //console.log("formatter:", cell, row);
          return (
            <div>

            <div className="sameline"><img src="like.png" width="32px" onClick={(x) => this.voteClick(x, row)}/></div>
            <div className="sameline">{cell}</div>
            </div>
          );
        };
    this.state = {voted: false};
  }

  voteClick(e, row) {

    if (!row.hasOwnProperty("voted")) {
      //console.log("voteclick", e, row);
      row['votes'] += 1;
      row['voted'] = true;
      this.setState({voted: true});
      axios.post(API_SITE + 'api/v1/vote/' + this.props.type + '/' + row['id']);
    }
  }

  render() {
    const defaultSorted = [{dataField: 'votes', order: 'desc'}];
    if (this.props.isLoading)
      return null;
    return (
      <div className="table1 spaceabove">
      <BootstrapTable keyField='id' pagination={paginationFactory()} striped hover
         data={this.props.data[this.props.type]} columns={this.columns}
         defaultSorted={defaultSorted}/>
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
    //columns[3]['events']['onClick'] = this.voteClick;
  }

  //voteClick(e, column, columnIdx, row, rowIdx) {
  //  console.log("voteclick", e, column, columnIdx, row, rowIdx);
  //
  //  row["votes"] += 1;
  //}

  async componentDidMount() {
    axios.get(API_SITE + 'api/v1/resources')
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
    //console.log("page");
    //console.log(this.state.data);
    return (
      <div>
      <center><h1>COVID-19 Cost Benefit</h1></center>
      <ScenarioSelector onClick={(x) => this.setScenario(x)} data={this.state.data} isLoading={this.state.isLoading}/>
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
