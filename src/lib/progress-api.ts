import { httpGet, httpPost } from "./http";

export async function toggleMarkResourceDoneApi({
  resourceId,
  resourceType,
  topicId,
}: {
  resourceId: string;
  resourceType: "roadmap" | "best-practice";
  topicId: string;
}) {
  const { response, error } = await httpPost(
    `${import.meta.env.PUBLIC_API_URL}/v1-toggle-topic`,
    {
      resourceId,
      resourceType,
      topicId,
    }
  );

  if (error) {
    return { response: undefined, error };
  }

  return { response, error: undefined };
}

export async function getUserResourceProgressApi({
  resourceId,
  resourceType,
}: {
  resourceId: string;
  resourceType: "roadmap" | "best-practice";
}) {
  const { response, error } = await httpGet(
    `${import.meta.env.PUBLIC_API_URL}/v1-progress?resourceType=${resourceType}&resourceId=${resourceId}`
  );

  if (error || !response) {
    console.error("Error fetching progress:", error);
    return { done: [] };
  }

  return {
    done: response.done || [],
  };
}
