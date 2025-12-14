import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getJson, postJson, deleteJson } from "../../utils/api";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query as { username?: string };
  const [profile, setProfile] = useState<any>(null);
  const [counts, setCounts] = useState<any>(null);

  useEffect(() => {
    if (username) load();
  }, [username]);

  async function load() {
    const res = await getJson(`/users/${username}`);
    setProfile(res?.user);
    setCounts(res?.counts);
  }

  async function follow() {
    await postJson(`/users/${username}/follow`, {});
    load();
  }

  async function unfollow() {
    await deleteJson(`/users/${username}/follow`);
    load();
  }

  return (
    <div className="container">
      {!profile ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1>{profile.username}</h1>
          <p>{profile.bio}</p>
          <div className="card">
            <p>Posts: {counts?.posts}</p>
            <p>Followers: {counts?.followers}</p>
            <p>Following: {counts?.following}</p>
            <button onClick={follow}>Follow</button>
            <button onClick={unfollow}>Unfollow</button>
          </div>
        </>
      )}
    </div>
  );
}
