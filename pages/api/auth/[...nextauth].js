import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { google } from 'googleapis';

async function getLinkedKickUsername(discordId) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Linked_Accounts!A2:B', 
    });

    const rows = response.data.values || [];
    const match = rows.find(row => row[0] === discordId);
    return match ? match[1].toLowerCase().trim() : null;
  } catch (error) {
    console.error("Error checking linked accounts: ", error);
    return null;
  }
}

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.discordId = token.sub;
      
      // Look up and attach the linked Kick username to the user's session
      const kickUsername = await getLinkedKickUsername(token.sub);
      session.user.kickUsername = kickUsername;

      // Handle Admin list (add your Discord user ID here)
      const admins = ['YOUR_PERSONAL_DISCORD_USER_ID_HERE']; 
      session.user.role = admins.includes(token.sub) ? 'admin' : 'user';

      return session;
    },
  },
};

export default NextAuth(authOptions);
