defineRouteMeta({
  openAPI: {
    description: "Get repository readme file on main branch (not cached).",
    parameters: [
      {
        name: "owner",
        in: "path",
        required: true,
        schema: { type: "string", example: "unjs" },
      },
      {
        name: "repo",
        in: "path",
        required: true,
        schema: { type: "string", example: "ofetch" },
      },
    ],
  },
});

export default defineHandler(async (event) => {
  return {
    ok: true
  }
})