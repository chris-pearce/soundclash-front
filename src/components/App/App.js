// Vendor
import React, {Component} from 'react';
// App
import {loadClashes} from './../../lib/service';
import {Header} from './../Header';


export class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clashes: []
        };
    }

    // componentDidMount() {
    //     loadClashes().then(clashes => this.setState({
    //         clashes
    //     }));
    // }

    render() {
        // console.log(this.state.clashes);
        return (
            <div>
                <Header />
                <p>Hello worlds</p>
            </div>
        );
    }
};