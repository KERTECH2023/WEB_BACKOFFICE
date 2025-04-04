/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/img-redundant-alt */
import Sidebar from "../../componentsfr/sidebar/Sidebar";
import Navbar from "../../componentsfr/navbar/Navbar";
import "./home.scss";
import Widget from "../../componentsfr/widget/Widget";
import Featured from "../../componentsfr/featured/Featured";
import Chart from "../../componentsfr/chart/Chart";
// import Table from "../../components/table/Table";

const Home = () => {
  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />

        <div className="big-image-container">
  <div className="big-image bg1"></div>
</div>
        {/* <div className="widgets">
          <Widget type="user" />
          <Widget type="order" />
          <Widget type="earning" />
          <Widget type="balance" />
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Months (Revenue)" aspect={2 / 1} />
        </div> */}
        {/* <div className="listContainer">
          <div className="listTitle">Latest Transactions</div>
          <Table />
        </div> */}
      </div>
    </div>
  );
};

export default Home;
