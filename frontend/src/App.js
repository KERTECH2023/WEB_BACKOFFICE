/* eslint-disable no-unused-vars */
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Listchauf from "./pages/listchauf/Listchauf";
import ListClient from "./pages/ListClient/ListClient";
import ListTraif from "./pages/ListTarif/ListTraif";
import SendNotificationPage from "./pages/sendnotificatiochauffeur/notificationchauff";
import SendNotificationPageClient from "./pages/sendnotificatioclient/notificationclient";
import Single from "./pages/single/Single";
import SingleC from "./pages/singlechauf/SingleC";
import SingleF from "./pages/SingleFact/SingleFacture";
import New from "./pages/new/New";
import NewCh from "./pages/NewChauf/NewCh";
import NewClient from "./pages/NewClient/NewClient";
import UpdCl from "./pages/updClient/UpdCl";
import UpdChauf from "./pages/UpdChauf/UpdChauf";
import FacturesPage from "./pages/Facture/Facture";
import Landingpage from "./pages/landingpage/landingpage";
import AgnetDesac from "./pages/AgentDesac/AgentDesac";
import ChauffDesac from "./pages/ChaufDesac/ChauffDesac";
import ClientDesa from "./pages/ClientDesa/ClientDesa";
import UpdateStat from "./pages/UpdateStatus/UpdateStat";
import TarifTransfert from "./pages/Tariftransfert/Tariftransfert";
import SingleClient from "./pages/SingleClient/SingleClient";
import UpdClientcl from "./pages/UpdClient_cl/UpdClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListReclamation from "./pages/ListReclamation/ListRec";
import SingleRecla from "./pages/SingleRecla/SingleRecla";
import NewRec from "./pages/NewRec/NewRec";
import ListNewChauf from "./pages/ListNewChauf/ListNewChauf";
import Log from "./pages/Log/Log";
import Passwordforget from "./pages/Fpassword/Passwordforget";
import Profile from "./pages/Profile/Profile";
import ListContact from "./pages/ListContact/ListContact";
import Transfert from "./pages/Transfert/Transfert.jsx";
import SingleCon from "./pages/SingleContact/SingleCon";
import ListFacture from "./pages/Facture/Facture";
import Liscourse from "./pages/Course/course";
import "./style/dark.scss";
import Gps from "./pages/gps/gps.jsx";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";


/* eslint-disable no-unused-vars */
import Homefr from "./pagesfr/home/Home";
import Loginfr from "./pagesfr/login/Login";
import Listfr from "./pagesfr/list/List";
import Listchauffr from "./pagesfr/listchauf/Listchauf";
import ListClientfr from "./pagesfr/ListClient/ListClient";
import ListTraiffr from "./pagesfr/ListTarif/ListTraif";
import SendNotificationPagefr from "./pagesfr/sendnotificatiochauffeur/notificationchauff";
import SendNotificationPageClientfr from "./pagesfr/sendnotificatioclient/notificationclient";
import Singlefr from "./pagesfr/single/Single";
import SingleCfr from "./pagesfr/singlechauf/SingleC";
import SingleFfr from "./pagesfr/SingleFact/SingleFacture";
import Newfr from "./pagesfr/new/New";
import NewChfr from "./pagesfr/NewChauf/NewCh";
import NewClientfr from "./pagesfr/NewClient/NewClient";
import UpdClfr from "./pagesfr/updClient/UpdCl";
import UpdChauffr from "./pagesfr/UpdChauf/UpdChauf";
import FacturesPagefr from "./pagesfr/Facture/Facture";
import Landingpagefr from "./pagesfr/landingpage/landingpage";
import AgnetDesacfr from "./pagesfr/AgentDesac/AgentDesac";
import ChauffDesacfr from "./pagesfr/ChaufDesac/ChauffDesac";
import ClientDesafr from "./pagesfr/ClientDesa/ClientDesa";
import UpdateStatfr from "./pagesfr/UpdateStatus/UpdateStat";
import TarifTransfertfr from "./pagesfr/Tariftransfert/Tariftransfert";
import SingleClientfr from "./pagesfr/SingleClient/SingleClient";
import UpdClientclfr from "./pagesfr/UpdClient_cl/UpdClient";
import ListReclamationfr from "./pagesfr/ListReclamation/ListRec";
import SingleReclafr from "./pagesfr/SingleRecla/SingleRecla";
import NewRecfr from "./pagesfr/NewRec/NewRec";
import ListNewChauffr from "./pagesfr/ListNewChauf/ListNewChauf";
import Logfr from "./pagesfr/Log/Log";
import Passwordforgetfr from "./pagesfr/Fpassword/Passwordforget";
import Profilefr from "./pagesfr/Profile/Profile";
import ListContactfr from "./pagesfr/ListContact/ListContact";
import Transfertfr from "./pagesfr/Transfert/Transfert.jsx";
import SingleConfr from "./pagesfr/SingleContact/SingleCon";
import ListFacturefr from "./pagesfr/Facture/Facture";
import Liscoursefr from "./pagesfr/Course/course";
import Gpsfr from "./pagesfr/gps/gps.jsx";
import Changemotdepasse from "./pagesfr/UpdmotpasseChauf/UpdmotdepasseChauf";
function App() {
  const { darkMode } = useContext(DarkModeContext);

  const isLoggedIn = window.localStorage.getItem("isLoggedIn") === "true";
  console.log(isLoggedIn, "login");

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isLoggedIn ? <Home /> : <Landingpage />} />
          {/* <Route index element={<Landingpage />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/gps" element={<Gps />} />
          <Route path="/log" element={<Log />} />
          <Route path="/pass" element={<Passwordforget />} />
          <Route
            path="/home"
            element={isLoggedIn ? <Home /> : <Landingpage />}
          />
          <Route
            path="cosnult/:id"
            element={isLoggedIn ? <Single /> : <Landingpage />}
          />
          <Route
            path="cosnultC/:id"
            element={isLoggedIn ? <SingleC /> : <Landingpage />}
          />
          <Route
            path="consultF/:id"
            element={isLoggedIn ? <SingleF /> : <Landingpage />}
          />

          <Route
            path="facture/:id"
            element={isLoggedIn ? <FacturesPage /> : <Landingpage />}
          />
          <Route
            path="update/:id"
            element={isLoggedIn ? <UpdCl /> : <Landingpage />}
          />
          <Route
            path="updateCh/:id"
            element={isLoggedIn ? <UpdChauf /> : <Landingpage />}
          />
          <Route
            path="updateClient/:id"
            element={isLoggedIn ? <UpdClientcl /> : <Landingpage />}
          />
          <Route
            path="Consultsast/:id"
            element={isLoggedIn ? <UpdateStat /> : <Landingpage />}
          />
          <Route
            path="ConsultCL/:id"
            element={isLoggedIn ? <SingleClient /> : <Landingpage />}
          />
          <Route
            path="ConsultRec/:id"
            element={isLoggedIn ? <SingleRecla /> : <Landingpage />}
          />
          <Route
            path="ConsultCon/:id"
            element={isLoggedIn ? <SingleCon /> : <Landingpage />}
          />
          <Route
            path="ConsultNewchauf"
            element={isLoggedIn ? <ListNewChauf /> : <Landingpage />}
          />
          <Route path="/profile" element={<Profile />} />

          <Route path="users">
            <Route index element={isLoggedIn ? <List /> : <Landingpage />} />
            <Route
              path="new"
              element={
                isLoggedIn ? (
                  <New title="Ajouté Nouveau User" />
                ) : (
                  <Landingpage />
                )
              }
            />
          </Route>

          <Route path="ConsultInvoices">
            <Route
              index
              element={isLoggedIn ? <ListFacture /> : <Landingpage />}
            />
          </Route>

                <Route path="Transfert">
            <Route
              index
              element={isLoggedIn ? <Transfert /> : <Landingpage />}
            />
          </Route>
                  <Route path="Tariftransfert">
            <Route
              index
              element={isLoggedIn ? <TarifTransfert /> : <Landingpage />}
            />
          </Route>

          <Route path="Chauffeur">
            <Route
              index
              element={isLoggedIn ? <Listchauf /> : <Landingpage />}
            />

            <Route
              path="new"
              element={
                isLoggedIn ? (
                  <NewCh title="Ajouté Nouveau Chauffeur" />
                ) : (
                  <Landingpage />
                )
              }
            />
          </Route>
          <Route path="Client">
            <Route
              index
              element={isLoggedIn ? <ListClient /> : <Landingpage />}
            />

            <Route
              path="newCL"
              element={
                isLoggedIn ? (
                  <NewClient title="Ajouté Nouveau Client" />
                ) : (
                  <Landingpage />
                )
              }
            />
          </Route>
          <Route path="Tarif">
            <Route
              index
              element={isLoggedIn ? <ListTraif /> : <Landingpage />}
            />
          </Route>
          <Route path="SendNotificationPage">
            <Route
              index
              element={isLoggedIn ? <SendNotificationPage /> : <Landingpage />}
            />
          </Route>
             <Route path="SendNotificationPageClient">
            <Route
              index
              element={isLoggedIn ? <SendNotificationPageClient /> : <Landingpage />}
            />
          </Route>
     
           

          <Route path="Liscourse">
            <Route
              index
              element={isLoggedIn ? <Liscourse /> : <Landingpage />}
            />
          </Route>

          <Route path="Rec">
            <Route
              index
              element={isLoggedIn ? <ListReclamation /> : <Landingpage />}
            />
            <Route
              path="NewRec"
              element={
                isLoggedIn ? (
                  <NewRec title="Ajouté Nouveau Reclamation" />
                ) : (
                  <Landingpage />
                )
              }
            />
          </Route>

          <Route path="Contact">
            <Route
              index
              element={isLoggedIn ? <ListContact /> : <Landingpage />}
            />
          </Route>

          <Route path="AgentDesactivé">
            <Route
              index
              element={isLoggedIn ? <AgnetDesac /> : <Landingpage />}
            />
          </Route>
          <Route path="ChauffeurDesactivé">
            <Route
              index
              element={isLoggedIn ? <ChauffDesac /> : <Landingpage />}
            />
          </Route>
          <Route path="ClientDesactivé">
            <Route
              index
              element={isLoggedIn ? <ClientDesa /> : <Landingpage />}
            />
          </Route>








          <Route path="/fr" element={isLoggedIn ? <Homefr /> : <Landingpage />} />
          {/* <Route index element={<Landingpage />} /> */}
          <Route path="/renitialisemotpassChfr" element={<Changemotdepasse />} />
          <Route path="/loginfr" element={<Loginfr />} />
          <Route path="/logfr" element={<Logfr />} />
          <Route path="/gpsfr" element={<Gpsfr />} />
          <Route path="/passfr" element={<Passwordforgetfr />} />
          <Route
            path="/homefr"
            element={isLoggedIn ? <Homefr /> : <Landingpagefr />}
          />
          <Route
            path="cosnultfr/:id"
            element={isLoggedIn ? <Singlefr /> : <Landingpagefr />}
          />
          <Route
            path="cosnultCfr/:id"
            element={isLoggedIn ? <SingleCfr /> : <Landingpagefr />}
          />
          <Route
            path="consultFfr/:id"
            element={isLoggedIn ? <SingleFfr /> : <Landingpagefr />}
          />

          <Route
            path="facturefr/:id"
            element={isLoggedIn ? <FacturesPagefr /> : <Landingpagefr />}
          />
          <Route
            path="updatefr/:id"
            element={isLoggedIn ? <UpdClfr /> : <Landingpagefr />}
          />
          <Route
            path="updateChfr/:id"
            element={isLoggedIn ? <UpdChauffr /> : <Landingpagefr />}
          />
          <Route
            path="updateClientfr/:id"
            element={isLoggedIn ? <UpdClientclfr /> : <Landingpagefr />}
          />
          <Route
            path="Consultsastfr/:id"
            element={isLoggedIn ? <UpdateStatfr /> : <Landingpagefr />}
          />
          <Route
            path="ConsultCLfr/:id"
            element={isLoggedIn ? <SingleClientfr /> : <Landingpagefr />}
          />
          <Route
            path="ConsultRecfr/:id"
            element={isLoggedIn ? <SingleReclafr /> : <Landingpagefr />}
          />
          <Route
            path="ConsultConfr/:id"
            element={isLoggedIn ? <SingleConfr /> : <Landingpagefr />}
          />
          <Route
            path="ConsultNewchauffr"
            element={isLoggedIn ? <ListNewChauffr /> : <Landingpagefr />}
          />
          <Route path="/profilefr" element={<Profilefr />} />

          <Route path="usersfr">
            <Route index element={isLoggedIn ? <Listfr /> : <Landingpagefr />} />
            <Route
              path="new"
              element={
                isLoggedIn ? (
                  <Newfr title="Ajouté Nouveau User" />
                ) : (
                  <Landingpage />
                )
              }
            />
          </Route>

          <Route path="ConsultInvoicesfr">
            <Route
              index
              element={isLoggedIn ? <ListFacturefr /> : <Landingpagefr />}
            />
          </Route>

                <Route path="Transfertfr">
            <Route
              index
              element={isLoggedIn ? <Transfertfr /> : <Landingpagefr/>}
            />
          </Route>
                  <Route path="Tariftransfertfr">
            <Route
              index
              element={isLoggedIn ? <TarifTransfertfr /> : <Landingpagefr />}
            />
          </Route>

          <Route path="Chauffeurfr">
            <Route
              index
              element={isLoggedIn ? <Listchauffr /> : <Landingpagefr />}
            />

            <Route
              path="newfr"
              element={
                isLoggedIn ? (
                  <NewChfr title="Ajouté Nouveau Chauffeur" />
                ) : (
                  <Landingpagefr />
                )
              }
            />
          </Route>
          <Route path="Clientfr">
            <Route
              index
              element={isLoggedIn ? <ListClientfr /> : <Landingpagefr />}
            />

            <Route
              path="newCLfr"
              element={
                isLoggedIn ? (
                  <NewClientfr title="Ajouté Nouveau Client" />
                ) : (
                  <Landingpagefr />
                )
              }
            />
          </Route>
          <Route path="Tariffr">
            <Route
              index
              element={isLoggedIn ? <ListTraiffr /> : <Landingpagefr />}
            />
          </Route>
          <Route path="SendNotificationPagefr">
            <Route
              index
              element={isLoggedIn ? <SendNotificationPagefr /> : <Landingpagefr />}
            />
          </Route>
             <Route path="SendNotificationPageClientfr">
            <Route
              index
              element={isLoggedIn ? <SendNotificationPageClientfr /> : <Landingpagefr />}
            />
          </Route>
     
           

          <Route path="Liscoursefr">
            <Route
              index
              element={isLoggedIn ? <Liscoursefr /> : <Landingpagefr />}
            />
          </Route>

          <Route path="Recfr">
            <Route
              index
              element={isLoggedIn ? <ListReclamationfr /> : <Landingpagefr />}
            />
            <Route
              path="NewRecfr"
              element={
                isLoggedIn ? (
                  <NewRecfr title="Ajouté Nouveau Reclamation" />
                ) : (
                  <Landingpagefr />
                )
              }
            />
          </Route>

          <Route path="Contactfr">
            <Route
              index
              element={isLoggedIn ? <ListContactfr /> : <Landingpagefr />}
            />
          </Route>

          <Route path="AgentDesactivéfr">
            <Route
              index
              element={isLoggedIn ? <AgnetDesacfr /> : <Landingpagefr />}
            />
          </Route>
          <Route path="ChauffeurDesactivéfr">
            <Route
              index
              element={isLoggedIn ? <ChauffDesacfr /> : <Landingpagefr />}
            />
          </Route>
          <Route path="ClientDesactivéfr">
            <Route
              index
              element={isLoggedIn ? <ClientDesafr /> : <Landingpagefr />}
            />
          </Route>













        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
