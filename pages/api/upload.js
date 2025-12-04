import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Use bodyParser with size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const logs = [];
  const addLog = (message) => {
    logs.push({ timestamp: new Date().toISOString(), message });
    console.log(`[UPLOAD] ${message}`);
  };

  try {
    addLog('Начало обработки загрузки файла');
    
    // Get file from request body (sent as base64 or buffer)
    const { fileData, fileName, fileType } = req.body;

    addLog(`Получены данные: fileName=${fileName}, fileType=${fileType}, fileData length=${fileData?.length || 0}`);

    if (!fileData) {
      addLog('ОШИБКА: Нет данных файла');
      return res.status(400).json({ error: 'No file data provided', logs });
    }

    const fileExtension = (fileName || fileType || '').split('.').pop().toLowerCase();
    addLog(`Определено расширение файла: ${fileExtension}`);
    
    let data = [];
    let columns = [];

    // Convert base64 to buffer if needed
    let fileBuffer;
    addLog('Конвертация base64 в buffer...');
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      // Data URL format: data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,...
      const base64Data = fileData.split(',')[1];
      fileBuffer = Buffer.from(base64Data, 'base64');
      addLog('Обработан Data URL формат');
    } else if (typeof fileData === 'string') {
      // Plain base64
      fileBuffer = Buffer.from(fileData, 'base64');
      addLog('Обработан plain base64');
    } else {
      // Already a buffer
      fileBuffer = Buffer.from(fileData);
      addLog('Использован готовый buffer');
    }

    addLog(`Размер buffer: ${fileBuffer.length} байт`);

    // Parse based on file type
    if (fileExtension === 'csv') {
      addLog('Парсинг CSV файла...');
      const csvText = fileBuffer.toString('utf-8');
      addLog(`CSV текст длина: ${csvText.length} символов`);
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });
      data = parsed.data;
      columns = parsed.meta.fields || [];
      addLog(`CSV распарсен: ${data.length} строк, ${columns.length} колонок`);
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      addLog('Парсинг Excel файла...');
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      addLog(`Используется лист: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      columns = Object.keys(data[0] || {});
      addLog(`Excel распарсен: ${data.length} строк, ${columns.length} колонок`);
    } else {
      addLog(`ОШИБКА: Неподдерживаемый формат: ${fileExtension}`);
      return res.status(400).json({ error: 'Unsupported file format. Use CSV or Excel files.', logs });
    }

    // Validate data
    if (!data || data.length === 0) {
      addLog('ОШИБКА: Файл пуст или не удалось распарсить');
      return res.status(400).json({ error: 'File is empty or could not be parsed', logs });
    }

    // Clean data - remove completely empty rows
    addLog('Очистка данных от пустых строк...');
    const beforeClean = data.length;
    data = data.filter(row => {
      return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
    });
    addLog(`Удалено пустых строк: ${beforeClean - data.length}`);

    addLog(`✅ Успешно обработано: ${data.length} строк, ${columns.length} колонок`);

    // Return parsed data
    return res.status(200).json({
      success: true,
      rows: data.length,
      columns: columns.length,
      columnNames: columns,
      sample: data.slice(0, 10), // First 10 rows as sample
      data: data, // Full data (for small files)
      logs: logs
    });
  } catch (error) {
    console.error('Upload error:', error);
    addLog(`КРИТИЧЕСКАЯ ОШИБКА: ${error.message}`);
    addLog(`Stack: ${error.stack}`);
    return res.status(500).json({ 
      error: 'Error processing file',
      message: error.message,
      logs: logs,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

