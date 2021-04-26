import React from 'react';
import FlightInterface from './FlightInterface.jsx';
import MakeDifferenceContainer from './MakeDifferenceContainer.jsx';

class MainContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flightInfo: {
        dep: 'xxx',
        arr: 'yyy',
        carbon: 0,
      },
      offsetActions: {
        trees: 1,
        meat: 1,
        bags: 1,
      },
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();

    const depArray = event.target.depField.value.split(',');
    const arrArray = event.target.arrField.value.split(',');
    const depCode = depArray[0];
    const arrCode = arrArray[0];
    // console.log("DEP CODE");
    // console.log(depCode);
    // console.log("ARR CODE");
    // console.log(arrCode);

    let carbonOutput = 0;

    let bodyData = {
      type: 'flight',
      passengers: event.target.paxField.value,
      legs: [
        {
          departure_airport: depCode,
          destination_airport: arrCode,
        },
      ],
    };

    // adding logic to handle round-trip flights (adds an additional object to the legs array)
    if (event.target.rtYN.value === 'yes')
      bodyData.legs.push({
        departure_airport: depCode,
        destination_airport: arrCode,
      });

    const requestOptions = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer Mtg90asNZIMTHndpW3YNFA',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    };

    fetch('https://www.carboninterface.com/api/v1/estimates', requestOptions)
      .then((response) => {
        console.log('raw response', response);
        return response.json();
      })
      .then((response) => {
        console.log('full data obj', response);
        console.log('emissions estimates', response.data.attributes);
        return (carbonOutput = response.data.attributes.carbon_kg);
      })
      .then((carbonOutput) => {
        this.setState({
          flightInfo: {
            dep: event.target.depField.value,
            arr: event.target.arrField.value,
            carbon: carbonOutput,
          },
        });
        console.log('state after query', this.state.flightInfo);
        const updateDatabase = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.state.flightInfo),
        };
        //working on posting the info to the database
        fetch('/api/newflight', updateDatabase)
          .then(() => console.log('sending flight data to database'))
          .catch((err) =>
            console.log('error sending flight data to database:', err)
          );
      });
    console.log('after state after query still in onSubmit');
  }

  componentDidUpdate() {
    console.log('mainContainer did mount');
  }

  render() {
    console.log('in the return of MainContainer');
    return (
      <div className='container'>
        <div className='outerBox'>
          <div id='header-container'>
            <p id='header'>Placeholder TBD</p>
          </div>
          <FlightInterface
            onSubmit={this.onSubmit}
            carbon={this.state.flightInfo.carbon}
          />
          {/* pass carbon flight info into this component */}
          <MakeDifferenceContainer
            actions={this.state.offsetActions}
            carbon={this.state.flightInfo.carbon}
          />
        </div>
      </div>
    );
  }
}

export default MainContainer;
