<?php

/**
 * Performance Testing Tool for TAG API
 * Measures the response time of the principal endpoints.
 */

$endpoints = [
    'Viajes (Paginated)' => 'http://127.0.0.1:8000/api/viajes',
    'Clientes (All)'     => 'http://127.0.0.1:8000/api/clientes',
    'Proveedores (All)'   => 'http://127.0.0.1:8000/api/proveedores',
    'Unidades'           => 'http://127.0.0.1:8000/api/unidades',
    'Choferes'           => 'http://127.0.0.1:8000/api/choferes',
];

echo "========================================\n";
echo "       TAG API PERFORMANCE TEST         \n";
echo "========================================\n\n";

foreach ($endpoints as $name => $url) {
    echo "Testing $name...\n";
    
    $start = microtime(true);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $end = microtime(true);
    $duration = round(($end - $start) * 1000, 2);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        $count = isset($data['total']) ? $data['total'] : (is_array($data) ? count($data) : 'N/A');
        echo "  [OK] Status: 200 | Time: {$duration}ms | Items: $count\n";
    } else {
        echo "  [ERROR] Status: $httpCode | Time: {$duration}ms | Error: $error\n";
    }
    echo "----------------------------------------\n";
}

echo "\nTest Finished.\n";
