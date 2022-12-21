import { FC, SyntheticEvent, useState } from "react";
import EmailValidator from "email-validator";

import { GithubTokenResponse } from "./api/github/token";
import { useLocalStorage } from "../hooks/useLocalStorage";

import styles from "../styles/Home.module.css";

type IssueVCProps = GithubTokenResponse;

const IssueVC: FC<IssueVCProps> = (props) => {
  const [storedToken] = useLocalStorage<string>("github_token");
  const [email, setEmail] = useState("");

  const handleIssueDeveloperVC = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (EmailValidator.validate(email)) {
      alert("invalid email address");
      return;
    }

    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_HOST}/api/affinidi/issue-vc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: storedToken, email }),
      }
    );
    console.log("resp:", resp);
  };

  return (
    <main className={styles.main}>
      <h1>Issue Your Developer VC</h1>
      <form onSubmit={handleIssueDeveloperVC}>
        <input
          type="email"
          value={email}
          placeholder="Enter your email address"
        />
        <button type="submit" onClick={handleIssueDeveloperVC} disabled>
          Issue VC
        </button>
      </form>
    </main>
  );
};

export default IssueVC;
