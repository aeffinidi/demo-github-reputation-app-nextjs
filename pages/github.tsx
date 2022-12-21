import { GetServerSideProps } from "next";
import { FC, useState } from "react";
import Link from "next/link";
import { RiBracesFill, RiUser5Line } from "react-icons/ri";

import { GithubTokenResponse } from "./api/github/token";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { GithubUser } from "../types/github";
import GitIcon from "../components/icons/GitIcon";

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
    <main className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="text-center mb-20">
          <h1 className="sm:text-3xl text-2xl font-medium title-font text-gray-900 mb-4">
            Fetch your data from Github
          </h1>
          <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-500s">
            Access Token
          </p>
          <pre>{storedToken || token}</pre>
          <div className="flex mt-6 justify-center">
            <div className="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
          </div>
        </div>
        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6">
          <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
            <div className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-5 flex-shrink-0">
              <RiUser5Line className="h-10 w-10" />
            </div>
            <div className="flex-grow">
              <h2 className="text-gray-900 text-lg title-font font-medium">
                User
              </h2>
              <button
                className="flex mx-auto mt-6 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                onClick={handleGetUserData}
              >
                Get Data
              </button>
              {user && (
                <p className="leading-relaxed text-base">
                  <pre>{JSON.stringify(user, undefined, 2)}</pre>
                </p>
              )}
            </div>
          </div>
          <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
            <div className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-5 flex-shrink-0">
              <GitIcon className="h-10 w-10" />
            </div>
            <div className="flex-grow">
              <h2 className="text-gray-900 text-lg title-font font-medium">
                Repos
              </h2>
              <button
                className="flex mx-auto mt-8 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                onClick={handleGetUserRepos}
              >
                Get Repos
              </button>
              {repos && (
                <p className="leading-relaxed text-base">
                  <pre>{JSON.stringify(repos, undefined, 2)}</pre>
                </p>
              )}
            </div>
          </div>
          <div className="p-4 md:w-1/3 flex flex-col text-center items-center">
            <div className="w-20 h-20 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 mb-5 flex-shrink-0">
              <RiBracesFill className="h-10 w-10" />
            </div>
            <div className="flex-grow">
              <h2 className="text-gray-900 text-lg title-font font-medium">
                Programming languages
              </h2>
              <button
                className="flex mx-auto mt-8 text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                onClick={handleGetUserReposLanguages}
              >
                Get programming languages
              </button>
              {languages && (
                <p className="leading-relaxed text-base">
                  <pre>{JSON.stringify(languages, undefined, 2)}</pre>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex mt-16 justify-center">
          <div className="w-16 h-1 rounded-full bg-indigo-500 inline-flex"></div>
        </div>
        <div className="flex flex-col justify-center items-center mt-16">
          <div>Or</div>
          <Link href="/issue-vc">
            <button className="flex mx-auto mt-8 text-white bg-black border-0 py-2 px-8 focus:outline-none hover:bg-gray-800 rounded text-lg">
              Issue your developer VC
            </button>
          </Link>
        </div>
      </div>
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
