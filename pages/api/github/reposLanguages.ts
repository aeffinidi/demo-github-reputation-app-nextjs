import { Octokit } from "@octokit/rest";
import type { NextApiRequest, NextApiResponse } from "next";

import { GithubReposLanguages } from "../../../types/github";

type GithubReposLanguagesResponse = {
  languages?: GithubReposLanguages[];
  error?: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<GithubReposLanguagesResponse>
) => {
  let { access_token: auth } = req.query;
  if (!auth || typeof auth !== "string") {
    res.status(404).json({ error: "No token" });
    return;
  }

  const kit = new Octokit({
    auth,
  });

  const userData = await kit.rest.users.getAuthenticated();
  const user = userData.data;
  const reposData = await kit.repos.listForAuthenticatedUser();
  const repos = reposData.data;

  const languages = Array.from(
    (
      await Promise.all(
        repos.map(async (repo) => {
          const r = await kit.repos.listLanguages({
            owner: user.login,
            repo: repo.name,
          });
          return Object.keys(r.data);
        })
      )
    )
      .flat()
      .reduce((acc, curr) => {
        acc.add(curr);
        return acc;
      }, new Set<string>())
  );

  res.status(200).json({ languages });
};

export default handler;
