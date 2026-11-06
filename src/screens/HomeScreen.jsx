import Screen from "../components/Screen";
import Button from "../components/Button";
import NameForm from "../components/NameForm";
import { HOME_BG } from "../data/themes";

export default function HomeScreen({ name, names, onSignIn, onSignOut, onPlay, onHistory }) {
  return (
    <Screen bg={HOME_BG} className="home">
      <h1 className="sr">Memory Match</h1>
      {name ? (
        <>
          <div className="row">
            <Button onClick={onPlay}>Play Game</Button>
            <Button onClick={onHistory}>History Hub</Button>
          </div>
          <p className="who">
            Playing as <b>{name}</b> ·{" "}
            <button className="link" type="button" onClick={onSignOut}>Switch player</button>
          </p>
        </>
      ) : (
        <NameForm names={names} onSubmit={onSignIn} />
      )}
    </Screen>
  );
}
