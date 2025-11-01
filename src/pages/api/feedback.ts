import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Option 1: Log to console (for development)
    console.log("Feedback received:", data);

    // Option 2: Send email using a service (you'll need to set this up)
    // Example: Using Resend, SendGrid, or similar
    // await sendEmail({
    //   to: 'feedback@devpath.sh',
    //   subject: `[${data.type}] ${data.title}`,
    //   text: `
    //     Type: ${data.type}
    //     URL: ${data.url || 'N/A'}
    //     Email: ${data.email || 'Anonymous'}
    //
    //     ${data.description}
    //   `
    // });

    // Option 3: Save to database
    // await db.feedback.create({ data });

    // Option 4: Create GitHub issue (if you want to track in GitHub)
    // const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    // await octokit.rest.issues.create({
    //   owner: 'jm961',
    //   repo: 'DevPath',
    //   title: `[Feedback] ${data.title}`,
    //   body: `
    //     **Type:** ${data.type}
    //     **URL:** ${data.url || 'N/A'}
    //     **Email:** ${data.email || 'Anonymous'}
    //
    //     ${data.description}
    //   `,
    //   labels: ['feedback', data.type]
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Feedback received successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Feedback submission error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
