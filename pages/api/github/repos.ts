import { Octokit } from "@octokit/rest";
import type { NextApiRequest, NextApiResponse } from "next";

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

  const kit = new Octokit({
    auth,
  });

  const resp = await kit.repos.listForAuthenticatedUser();
  res.status(200).json({ repos: resp.data });
};

export default handler;
