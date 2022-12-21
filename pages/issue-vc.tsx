import { FC, SyntheticEvent, useEffect, useRef, useState } from "react";
import EmailValidator from "email-validator";

import { GithubTokenResponse } from "./api/github/token";
import { useLocalStorage } from "../hooks/useLocalStorage";

import styles from "../styles/Home.module.css";

type IssueVCProps = GithubTokenResponse;

const IssueVC: FC<IssueVCProps> = (props) => {
  const [storedToken] = useLocalStorage<string>("github_token");
  const [error, setError] = useState("");
  const email = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    email.current?.focus();
  }, []);

  const handleIssueDeveloperVC = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!EmailValidator.validate(email.current?.value || "")) {
      alert("invalid email address");
      return;
    }

    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_HOST}/api/affinidi/issue-vc`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: storedToken,
            email: email.current?.value,
          }),
        }
      );
      if (![200, 201].includes(resp.status)) {
        throw Error();
      }
      console.log("response json data:", await resp.json());
      setError("");
    } catch (error) {
      setError("There was an error when trying to issue your VC");
    }
  };

  return (
    <main className={styles.main}>
      <h1>Issue Your Developer VC</h1>
      <form onSubmit={handleIssueDeveloperVC}>
        <input
          type="email"
          ref={email}
          placeholder="Enter your email address"
        />
        <button type="submit" onClick={handleIssueDeveloperVC}>
          Issue VC
        </button>
        {error && (
          <div>
            <pre>{error}</pre>
          </div>
        )}
      </form>
    </main>
  );
};

export default IssueVC;
