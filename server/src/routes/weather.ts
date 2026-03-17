import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/weather — Proxy to OpenWeatherMap
router.get('/', async (req: Request, res: Response) => {
    try {
        const city = req.query.city as string;
        if (!city) {
            res.status(400).json({ error: 'City parameter is required' });
            return;
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            // Return mock data if no API key configured
            res.json({
                city,
                temp: 22,
                description: 'Clear sky',
                icon: '01n',
                humidity: 65,
                mock: true,
            });
            return;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json() as any;

        if (!response.ok) {
            res.status(response.status).json({ error: data.message || 'Weather API error' });
            return;
        }

        res.json({
            city: data.name,
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
        });
    } catch (error) {
        console.error('Error fetching weather:', error);
        res.status(500).json({ error: 'Failed to fetch weather' });
    }
});

export default router;
