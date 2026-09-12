const { connectLambda, getStore } = require("@netlify/blobs");

function resp(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

exports.handler = async (event) => {
  connectLambda(event);
  const store = getStore("aronnax");

  try {
    if (event.httpMethod === "GET") {
      const key = event.queryStringParameters && event.queryStringParameters.key;
      if (!key) return resp(400, { error: "missing key" });
      const value = await store.get(key);
      return resp(200, { value: value === null || value === undefined ? null : value });
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.key) return resp(400, { error: "missing key" });
      await store.set(body.key, body.value ?? "");
      return resp(200, { ok: true });
    }

    return resp(405, { error: "method not allowed" });
  } catch (err) {
    return resp(500, { error: String((err && err.message) || err) });
  }
};

