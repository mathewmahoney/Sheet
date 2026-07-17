import { google } from "googleapis";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session || !session.user.kickUsername) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userKick = session.user.kickUsername.toLowerCase().trim();

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Stream_Giveaways!A2:H", // A: Entry_ID, B: Type, C: Winner_Kick, D: Claimed
    });

    const rows = response.data.values || [];

    // Filter rows where the winner matches this user AND has not been claimed yet
    const userPrizes = rows
      .filter((row) => row[2]?.toLowerCase().trim() === userKick && row[3] !== "TRUE")
      .map((row) => ({
        id: row[0],
        type: row[1],
        winner: row[2],
        claimed: row[3],
      }));

    return res.status(200).json({ prizes: userPrizes });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
