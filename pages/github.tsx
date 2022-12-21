import { GetServerSideProps } from "next";
import { FC, useState } from "react";

import { GithubTokenResponse } from "./api/github/token";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { GithubUser } from "../types/github";

import styles from "../styles/Home.module.css";
import Link from "next/link";

type GithubProps = GithubTokenResponse;

const Github: FC<GithubProps> = (props) => {
  const { token } = props;
  const [storedToken] = useLocalStorage<string>("github_token", token);
  const [user, setUser] = useState<GithubUser>();
  const [repos, setRepos] = useState(null);
  const [languages, setLanguages] = useState(null);

  const handleGetUserData = async () => {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/github/user?access_token=${storedToken}`
    );
    const user: GithubUser = await resp.json();
    setUser(user);
  };

  const handleGetUserRepos = async () => {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/github/repos?access_token=${storedToken}`
    );
    const data = await resp.json();
    setRepos(data.repos);
  };
  const handleGetUserReposLanguages = async () => {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/github/reposLanguages?access_token=${storedToken}`
    );
    const data = await resp.json();
    setLanguages(data.languages);
  };

  return (
    <main className={styles.main}>
      <h1>Fetch your data from Github</h1>
      <div>
        <h2>Access Token</h2>
        <pre>{storedToken || token}</pre>
      </div>
      <button onClick={handleGetUserData}>Get User Data</button>
      {user && (
        <p>
          <pre>{JSON.stringify(user, undefined, 2)}</pre>
        </p>
      )}
      <button onClick={handleGetUserRepos}>Get User Repos</button>
      {repos && (
        <p>
          <pre>{JSON.stringify(repos, undefined, 2)}</pre>
        </p>
      )}
      <button onClick={handleGetUserReposLanguages}>
        Get User&apos;s programming languages
      </button>
      {languages && (
        <p>
          <pre>{JSON.stringify(languages, undefined, 2)}</pre>
        </p>
      )}
      <h1>Or issue your data developer VC</h1>
      <Link href="/issue-vc">To VS Issuer form</Link>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const code = query["code"];
  if (!code) {
    return {
      props: {},
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}/api/github/token?code=${code}`
  );
  const data: GithubTokenResponse = await res.json();

  return {
    props: { token: data.token || null }, // will be passed to the page component as props
  };
};

export default Github;
