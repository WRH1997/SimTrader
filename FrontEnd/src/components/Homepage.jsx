import React from "react";
import { useNavigate } from "react-router-dom";
import Logout from './Logout';
import CreatePortfolio from './CreatePortfolio';
import Popup from 'reactjs-popup';

export default function Homepage(){

    const nav = useNavigate();

    const [portfolios, setPortfolios] = React.useState();
    const [loading, setLoading] = React.useState(true);


    React.useEffect(() => {
        const getPortfolios = async () => {
            let username = localStorage.user;
            let data = await fetch(process.env.REACT_APP_API_GATEWAY +'/portfolios/userportfolios', {
                method: 'POST',
                body: JSON.stringify({"username": username})
            });
            let res = await data.json();
            let portfolios = res['body'];
            setLoading(false);
            setPortfolios(portfolios);
        }
        getPortfolios();
    }, [])

    React.useEffect(() => {}, portfolios);


    const Create = () => {
        nav('/createPort');
    }

    const ViewPort = (event) => {
        event.preventDefault();
        let portName = event.target.id;
        localStorage.setItem('viewPort', portName);
        nav('/portfolioView');
    }

    return(
        <div>
            <center>
                <div className='hmpg-port'>
                    <br></br>
                    <h2>Your Portfolios:</h2>
                    <div>
                        {loading ? <div>Loading...</div> : null}
                        {Object.keys(portfolios || {})?.map((key, i) => (
                            <div id={key} onClick={ViewPort} className='ps-div'>{key}</div>
                        ))}
                    </div>
                    <br></br>
                    <Popup trigger={<button className="create-btn"> Create Portfolio</button>} position="right center">
                        <CreatePortfolio />
                    </Popup>
                </div>
            </center>
            <Logout/>
        </div>
    )
}
