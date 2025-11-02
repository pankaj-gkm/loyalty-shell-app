import "./App.css";
import Dashboard from "./components/dashboard";

const LOCALHOST_3000 = "http://localhost:3000/";
const LOCALHOST_3001 = "http://localhost:3001/";
const STAGE = "https://stage.kstore.global/";
const PROD = "https://kstore.global/";

console.log(LOCALHOST_3000, LOCALHOST_3001, STAGE, PROD);

function App() {
  return <Dashboard />;
}

export default App;
