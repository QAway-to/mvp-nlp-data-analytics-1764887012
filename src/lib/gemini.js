import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Process natural language query and generate SQL or analysis
 */
export async function processNLQuery(query, dataSchema, sampleData) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const schemaDescription = generateSchemaDescription(dataSchema, sampleData);
    
    const prompt = `Ты - эксперт по анализу данных. Пользователь задал вопрос на естественном языке о данных.

Схема данных:
${schemaDescription}

Вопрос пользователя: "${query}"

Твоя задача:
1. Понять, что хочет пользователь
2. Предложить способ анализа данных
3. Если нужен SQL запрос - сгенерируй его (данные в таблице "data")
4. Если нужна статистика - опиши какие метрики вычислить
5. Если нужна визуализация - опиши тип графика и данные

Верни JSON в формате:
{
  "type": "sql" | "statistics" | "visualization" | "text",
  "sql": "SELECT ..." (если type = "sql"),
  "statistics": ["mean", "median", "count"] (если type = "statistics"),
  "visualization": {
    "chartType": "line" | "bar" | "pie" | "scatter",
    "xAxis": "column_name",
    "yAxis": "column_name"
  },
  "description": "Описание что будет сделано",
  "message": "Ответ пользователю"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if no JSON found
    return {
      type: 'text',
      message: text,
      description: 'Анализ выполнен'
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Ошибка обработки запроса: ${error.message}`);
  }
}

/**
 * Generate data analysis summary
 */
export async function generateDataSummary(data, columns) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const sampleRows = data.slice(0, 10).map(row => 
      Object.values(row).join(', ')
    ).join('\n');

    const prompt = `Проанализируй данные и дай краткое саммари:

Колонки: ${columns.join(', ')}
Количество строк: ${data.length}

Примеры данных (первые 10 строк):
${sampleRows}

Дай краткое саммари на русском языке (2-3 предложения) о том, что представляют собой эти данные, какие основные паттерны видишь, есть ли аномалии.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini summary error:', error);
    return 'Не удалось сгенерировать саммари данных';
  }
}

/**
 * Generate schema description for prompts
 */
function generateSchemaDescription(schema, sampleData) {
  if (!schema || schema.length === 0) {
    return 'Нет данных';
  }

  let description = 'Колонки:\n';
  schema.forEach(col => {
    const sampleValue = sampleData[0]?.[col] ?? 'N/A';
    description += `- ${col}: пример значения "${sampleValue}"\n`;
  });

  description += `\nВсего строк: ${sampleData.length}`;
  return description;
}

