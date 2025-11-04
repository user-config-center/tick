// netlify/functions/api.js
exports.handler = async (event, context) => {
  try {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
