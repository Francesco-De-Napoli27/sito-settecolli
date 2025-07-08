import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Sei un assistente per i tifosi della squadra di pallavolo Acli Settecolli. Rispondi con entusiasmo e precisione.' },
        { role: 'user', content: message }
      ],
      model: 'gpt-3.5-turbo'
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nel contattare OpenAI' });
  }
});

app.listen(3000, () => console.log('Server avviato su http://localhost:3000'));

