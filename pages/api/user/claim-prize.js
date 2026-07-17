// pages/api/user/claim-prize.js
export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !session.user.kickUsername) {
    return res.status(401).json({ error: 'Unauthorized or Kick account not linked via Discord' });
  }

  const userKickUsername = session.user.kickUsername.toLowerCase();
  const { entryId, stakeUser, platform, ltcAddress } = req.body;

  // ... (Initialize Google Sheets connection) ...

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Stream_Giveaways!A2:D',
  });

  const rows = response.data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === entryId) + 2;
  const currentWinner = rows[rowIndex - 2][2]?.trim().toLowerCase();

  // STOPS FRAUD: The Discord-derived Kick username must match the logged prize winner
  if (currentWinner !== userKickUsername) {
    return res.status(403).json({ error: 'This prize was not drawn for your linked Kick account' });
  }

  // Update sheet to save details and mark Claimed = TRUE
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Stream_Giveaways!D${rowIndex}:G${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['TRUE', stakeUser, platform, ltcAddress]],
    },
  });

  return res.status(200).json({ success: true });
}
