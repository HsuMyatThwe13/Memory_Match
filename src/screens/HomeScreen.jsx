import Screen from "../components/Screen";
import Button from "../components/Button";
import { HOME_BG } from "../data/themes";

export default function HomeScreen({ onStart }) {
  return (
    <Screen bg={HOME_BG} className="home">
      <h1 className="sr">Memory Match</h1>
      <Button onClick={onStart}>Start</Button>
    </Screen>
  );
}
