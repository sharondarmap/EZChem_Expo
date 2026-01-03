import { API } from "./api"

export async function reportLearningProgress(
  moduleTitle: string,
  action: string
) {
  return API.fetchJSON("/progress/learning", {
    method: "POST",
    body: {
      module: moduleTitle,
      action,
    },
  })
}
