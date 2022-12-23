import { Octokit } from "@octokit/rest";
import type { NextApiRequest, NextApiResponse } from "next";

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

  if (auth.indexOf("Bearer") === -1) {
    auth = `Bearer ${auth}`;
  }

  const resp = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: auth,
    },
  });
  const user: GithubUser = await resp.json();

  res.json({ user });
};

export default handler;
