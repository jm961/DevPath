const pool = require("../config/database");

// Toggle mark resource as done
exports.toggleMarkResourceDone = async (req, res) => {
  const { resourceId, resourceType, topicId } = req.body;
  const userId = req.userId;

  try {
    // Validate input
    if (!resourceId || !resourceType || !topicId) {
      return res.status(400).json({
        status: 400,
        message: "resourceId, resourceType, and topicId are required",
      });
    }

    // Check if already marked as done
    const existing = await pool.query(
      "SELECT id FROM user_progress WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3 AND topic_id = $4",
      [userId, resourceType, resourceId, topicId]
    );

    let completed = true;

    if (existing.rows.length > 0) {
      // Remove (toggle off)
      await pool.query(
        "DELETE FROM user_progress WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3 AND topic_id = $4",
        [userId, resourceType, resourceId, topicId]
      );
      completed = false;
    } else {
      // Add (toggle on)
      await pool.query(
        "INSERT INTO user_progress (user_id, resource_type, resource_id, topic_id, completed_at) VALUES ($1, $2, $3, $4, NOW())",
        [userId, resourceType, resourceId, topicId]
      );
    }

    res.json({
      status: "ok",
      message: "Progress updated",
      completed,
    });
  } catch (error) {
    console.error("Toggle progress error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

// Get user resource progress
exports.getUserResourceProgress = async (req, res) => {
  const { resourceId, resourceType } = req.query;
  const userId = req.userId;

  try {
    // Validate input
    if (!resourceId || !resourceType) {
      return res.status(400).json({
        status: 400,
        message: "resourceId and resourceType are required",
      });
    }

    const result = await pool.query(
      "SELECT topic_id, completed_at FROM user_progress WHERE user_id = $1 AND resource_type = $2 AND resource_id = $3 ORDER BY completed_at DESC",
      [userId, resourceType, resourceId]
    );

    const progress = result.rows.map((row) => ({
      topic_id: row.topic_id,
      completed_at: row.completed_at,
    }));

    // Also return simple array for backward compatibility
    const done = result.rows.map((row) => row.topic_id);

    res.json({
      status: "ok",
      progress,
      done, // For backward compatibility
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
