import { Octokit } from "@octokit/rest";
import type { NextApiRequest, NextApiResponse } from "next";

import GithubService from "../../../services/github";
import { GithubUser } from "../../../types/github";

type Data = {
  user?: GithubUser;
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  let { access_token: auth } = req.query;
  if (!auth || typeof auth !== "string") {
    res.status(404).json({ error: "No token" });
    return;
  }

  const user = await GithubService.getUserData(new Octokit({ auth }));

  res.json({ user });
};

export default handler;
