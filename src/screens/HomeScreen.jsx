import Screen from "../components/Screen";
import Button from "../components/Button";
import NameForm from "../components/NameForm";
import ProfileMenu from "../components/ProfileMenu";
import { HOME_BG } from "../data/themes";

export default function HomeScreen({ name, profile, onCheck, onSignIn, onSignOut, onDelete, onPlay, onHistory }) {
  return (
    <Screen bg={HOME_BG} className={name ? "home in" : "home"}>
      <h1 className="sr">Memory Match</h1>
      {name ? (
        <>
          <ProfileMenu name={name} profile={profile} onSignOut={onSignOut} onDelete={onDelete} />
          <div className="row">
            <Button onClick={onPlay}>Play Game</Button>
            <Button onClick={onHistory}>History Hub</Button>
          </div>
        </>
      ) : (
        <NameForm onCheck={onCheck} onSubmit={onSignIn} />
      )}
    </Screen>
  );
}
