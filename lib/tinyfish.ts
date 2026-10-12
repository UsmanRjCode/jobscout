import type { RawJob } from "./types";

type TinyFishResult = {
  title?: string;
  url?: string;
  link?: string;
  snippet?: string;
  description?: string;
  source?: string;
};

type TinyFishResponse = {
  results?: TinyFishResult[];
  data?: TinyFishResult[];
};

export async function searchTinyFish(query: string): Promise<RawJob[]> {
  const apiKey = process.env.TINYFISH_API_KEY;

  if (!apiKey) {
    throw new Error("TINYFISH_API_KEY is missing");
  }

  const searchUrl = new URL("https://api.search.tinyfish.ai");

  searchUrl.searchParams.set("query", query);

  const response = await fetch(searchUrl.toString(), {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorMessage = await response.text();

    throw new Error(
      `TinyFish request failed: ${response.status} ${errorMessage}`
    );
  }

  const responseData =
    (await response.json()) as TinyFishResponse;

  const results = responseData.results ?? responseData.data ?? [];

  return results
    .map((result) => {
      const url = result.url || result.link || "";
      let source = result.source || "";
      if (!source && url) {
        try {
          source = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          source = "Web result";
        }
      }
      return {
        title: result.title || "Untitled job",
        url,
        snippet: result.snippet || result.description || "",
        source: source || "Web result",
      };
    })
    .filter((result) => result.url);
}

export async function fetchTinyFish(url: string): Promise<string> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) return "";

  try {
    const fetchUrl = new URL("https://api.fetch.tinyfish.ai");
    fetchUrl.searchParams.set("url", url);

    const response = await fetch(fetchUrl.toString(), {
      method: "GET",
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      signal: AbortSignal.timeout(4000), // Prevent hanging
    });

    if (!response.ok) {
      console.warn("TinyFish Fetch returned an error:", {
        url,
        status: response.status,
      });
      return "";
    }
    const data = await response.json();
    return data.content || data.text || data.markdown || "";
  } catch (error) {
    console.warn("TinyFish Fetch could not read listing:", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
}

export async function agentTinyFish(content: string, jobTitle: string): Promise<string> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) return "";

  try {
    const agentUrl = new URL("https://api.agent.tinyfish.ai");
    const response = await fetch(agentUrl.toString(), {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        prompt: `You are a helpful career assistant. Analyze this job posting for "${jobTitle}". In exactly one short sentence, summarize any key requirements, salary details, or remote work policies mentioned. If none are found, just say "Looks like a standard role with no unusual requirements."`,
        content: content.slice(0, 4000), // Keep payload small and fast
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      console.warn("TinyFish Agent returned an error:", {
        jobTitle,
        status: response.status,
      });
      return "";
    }
    const data = await response.json();
    return data.reply || data.response || data.text || data.answer || "";
  } catch (error) {
    console.warn("TinyFish Agent could not analyze listing:", {
      jobTitle,
      error: error instanceof Error ? error.message : String(error),
    });
    return "";
  }
}
