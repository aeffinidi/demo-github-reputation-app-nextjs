import { Octokit } from "@octokit/rest";
import type { NextApiRequest, NextApiResponse } from "next";

import GithubService from "../../../services/github";
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

  const languages = await GithubService.getUserProgrammingLanguages(
    new Octokit({ auth })
  );

  res.status(200).json({ languages });
};

export default handler;
