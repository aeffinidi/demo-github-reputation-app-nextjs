import { Octokit } from "@octokit/rest";
import type { NextApiRequest, NextApiResponse } from "next";

import GithubService from "../../../services/github";
import { GithubRepo } from "../../../types/github";

type GithubReposResponse = {
  repos?: GithubRepo[];
  error?: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<GithubReposResponse>
) => {
  let { access_token: auth } = req.query;
  if (!auth || typeof auth !== "string") {
    res.status(404).json({ error: "No token" });
    return;
  }

  const repos = await GithubService.getUserRepos(new Octokit({ auth }));

  res.status(200).json({ repos });
};

export default handler;
