// app/page.tsx
import { useState } from 'react';
import Chart from 'chart.js/auto';

interface Company {
  name: string;
  symbol: string;
}

const companyList: Company[] = [
  { name: 'Apple', symbol: 'AAPL' },
  { name: 'Google', symbol: 'GOOGL' },
  { name: 'Microsoft', symbol: 'MSFT' },
  { name: 'Amazon', symbol: 'AMZN' },
];

export default function Home() {
  const [candleChart, setCandleChart] = useState<Chart | null>(null);
  const [symbol, setSymbol] = useState<string>('');
  const [prices, setPrices] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const fetchCandles = async (symbol: string) => {
    const response = await fetch(`/api/candles/${symbol}`);
    const data = await response.json();

    if (data.s === 'ok') {
      const newLabels = data.t.map((timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString());
      setPrices(data.c);
      setLabels(newLabels);

      if (candleChart) {
        candleChart.destroy();
      }

      const ctx = document.getElementById('candle-chart') as HTMLCanvasElement;
      const newChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels: newLabels,
          datasets: [{
            label: symbol,
            data: data.c,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
          }],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Price',
              },
            },
          },
        },
      });

      setCandleChart(newChart);
    } else {
      console.error('Error fetching candles:', data);
    }
  };

  return (
      <div className="flex h-screen">
        <div className="w-1/4 bg-gray-800 text-white p-4">
          <h1 className="text-2xl mb-4">Companies</h1>
          <ul id="company-list">
            {companyList.map(company => (
                <li
                    key={company.symbol}
                    data-symbol={company.symbol}
                    className="rounded-lg cursor-pointer hover:bg-gray-700 p-2"
                    onClick={() => {
                      setSymbol(company.symbol);
                      fetchCandles(company.symbol);
                    }}
                >
                  {company.name} ({company.symbol})
                </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4 p-4">
          <h1 className="text-2xl mb-4">Stock Candles</h1>
          <div id="candles" className="border p-4">
            <h2 className="text-xl mb-2">{symbol ? `Candles for ${symbol}` : 'Select a company to see candles'}</h2>
            <canvas id="candle-chart"></canvas>
          </div>
        </div>
      </div>
  );
}
