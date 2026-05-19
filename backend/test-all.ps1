# Deep Test All Services
param([string]$BaseUrl = "http://localhost")

function Test-Api($method, $url, $body = $null, $expected = 200) {
    try {
        $params = @{ Uri = $url; Method = $method; ContentType = "application/json" }
        if ($body) { $params.Body = $body }
        $r = Invoke-RestMethod @params
        return @{ Success = $true; Data = $r }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

Write-Host "`n=== DEEP TEST ALL SERVICES ===" -ForegroundColor Cyan

# 1. AFFILIATE SERVICE (8081)
Write-Host "`n[AFFILIATE SERVICE - Port 8081]" -ForegroundColor Yellow
$aff = @{ name = "Test Aff $(Get-Random)"; email = "test$(Get-Random)@test.com"; phone = "1234567890"; website = "https://test.com"; active = $true } | ConvertTo-Json
$r = Test-Api "POST" "$BaseUrl`:8081/api/affiliate" $aff 201
if ($r.Success) { Write-Host "  CREATE: PASS (ID: $($r.Data.id))" -ForegroundColor Green; $aid = $r.Data.id } else { Write-Host "  CREATE: FAIL" -ForegroundColor Red }
$r = Test-Api "GET" "$BaseUrl`:8081/api/affiliate"
Write-Host "  LIST: $($(if($r.Success){'PASS'}else{'FAIL'})) ($($r.Data.Count) items)" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})
if ($aid) { $r = Test-Api "GET" "$BaseUrl`:8081/api/affiliate/$aid"; Write-Host "  GET BY ID: $($(if($r.Success){'PASS'}else{'FAIL'})) (Name: $($r.Data.name))" -ForegroundColor $(if($r.Success){'Green'}else{'Red'}) }

# 2. CAMPAIGN SERVICE (8082)
Write-Host "`n[CAMPAIGN SERVICE - Port 8082]" -ForegroundColor Yellow
$cmp = @{ name = "Test Camp $(Get-Random)"; description = "Test"; startDate = "2026-01-01"; endDate = "2026-12-31"; commissionRate = 0.15; status = "ACTIVE"; affiliateId = 27 } | ConvertTo-Json
$r = Test-Api "POST" "$BaseUrl`:8082/api/campaigns" $cmp 201
if ($r.Success) { Write-Host "  CREATE: PASS (ID: $($r.Data.id))" -ForegroundColor Green; $cid = $r.Data.id } else { Write-Host "  CREATE: FAIL - $($r.Error)" -ForegroundColor Red }
$r = Test-Api "GET" "$BaseUrl`:8082/api/campaigns"
Write-Host "  LIST: $($(if($r.Success){'PASS'}else{'FAIL'}))" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})

# 3. CONVERSION SERVICE (8083)
Write-Host "`n[CONVERSION SERVICE - Port 8083]" -ForegroundColor Yellow
$conv = @{ affiliateId = 27; campaignId = 20; productId = 1; amount = 99.99; source = "test"; clickId = "clk-$(Get-Random)"; customerId = "cust-$(Get-Random)" } | ConvertTo-Json
$r = Test-Api "POST" "$BaseUrl`:8083/api/conversions" $conv 201
if ($r.Success) { Write-Host "  CREATE: PASS (ID: $($r.Data.id))" -ForegroundColor Green } else { Write-Host "  CREATE: FAIL - $($r.Error)" -ForegroundColor Red }
$r = Test-Api "GET" "$BaseUrl`:8083/api/conversions"
Write-Host "  LIST: $($(if($r.Success){'PASS'}else{'FAIL'}))" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})

# 4. PRODUCT SERVICE (8085) - Testing affiliateName & campaignName
Write-Host "`n[PRODUCT SERVICE - Port 8085]" -ForegroundColor Yellow
$prod = @{ name = "Test Prod $(Get-Random)"; description = "Test"; price = 99.99; commissionPercentage = 15; sku = "SKU-$(Get-Random)"; category = "Test"; imageUrl = "https://img.com/1.jpg"; affiliateId = 27; campaignId = 20; active = $true } | ConvertTo-Json
$r = Test-Api "POST" "$BaseUrl`:8085/api/products" $prod 201
if ($r.Success) { 
    Write-Host "  CREATE: PASS (ID: $($r.Data.id))" -ForegroundColor Green
    Write-Host "    affiliateName: $($r.Data.affiliateName)" -ForegroundColor Gray
    Write-Host "    campaignName: $($r.Data.campaignName)" -ForegroundColor Gray
    $pid = $r.Data.id 
} else { 
    Write-Host "  CREATE: FAIL - $($r.Error)" -ForegroundColor Red 
}
if ($pid) { 
    $r = Test-Api "GET" "$BaseUrl`:8085/api/products/$pid" 
    Write-Host "  GET BY ID: $($(if($r.Success){'PASS'}else{'FAIL'}))" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})
    if ($r.Success) {
        Write-Host "    affiliateName: $($r.Data.affiliateName)" -ForegroundColor $(if($r.Data.affiliateName){'Green'}else{'Red'})
        Write-Host "    campaignName: $($r.Data.campaignName)" -ForegroundColor $(if($r.Data.campaignName){'Green'}else{'Red'})
    }
}
$r = Test-Api "GET" "$BaseUrl`:8085/api/products"
Write-Host "  LIST: $($(if($r.Success){'PASS'}else{'FAIL'})) ($($r.Data.Count) items)" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})

# 5. PAYMENT SERVICE (8084)
Write-Host "`n[PAYMENT SERVICE - Port 8084]" -ForegroundColor Yellow
$pay = @{ idempotencyKey = "key-$(Get-Random)"; affiliateId = 27; campaignId = 20; conversionId = 1; amount = 150; currency = "USD"; paymentMethod = "credit_card" } | ConvertTo-Json
$r = Test-Api "POST" "$BaseUrl`:8084/api/payments" $pay 201
if ($r.Success) { 
    Write-Host "  CREATE: PASS (ID: $($r.Data.id), Status: $($r.Data.status))" -ForegroundColor Green 
    $payid = $r.Data.id 
} else { 
    Write-Host "  CREATE: FAIL - $($r.Error)" -ForegroundColor Red 
}
if ($payid) { 
    Start-Sleep 2
    $r = Test-Api "GET" "$BaseUrl`:8084/api/payments/$payid"
    Write-Host "  GET BY ID: $($(if($r.Success){'PASS'}else{'FAIL'})) (Status: $($r.Data.status))" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})
    $r = Test-Api "POST" "$BaseUrl`:8084/api/payments/$payid/refund"
    Write-Host "  REFUND: $($(if($r.Success){"PASS (Status: $($r.Data.status))"}else{'FAIL'}))" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})
}
$r = Test-Api "GET" "$BaseUrl`:8084/api/payments"
Write-Host "  LIST: $($(if($r.Success){'PASS'}else{'FAIL'})) ($($r.Data.Count) payments)" -ForegroundColor $(if($r.Success){'Green'}else{'Red'})

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
