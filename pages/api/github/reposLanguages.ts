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

  const owner = "aeffinidi";
  const names = ["advent-of-code-2022", "demo-github-reputation-app-nextjs"];

  const languages = Array.from(
    (
      await Promise.all(
        names.map(async (n) => {
          const r = await kit.repos.listLanguages({ owner, repo: n });
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
