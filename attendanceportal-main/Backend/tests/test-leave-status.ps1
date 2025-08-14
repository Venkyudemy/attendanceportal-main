Write-Host "Testing Leave Status Update Functionality..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Get all leave requests
Write-Host "1. Fetching all leave requests..." -ForegroundColor Yellow
try {
    $leaveResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/leave/admin" -Method GET
    $leaveRequests = $leaveResponse.Content | ConvertFrom-Json
    Write-Host "Found $($leaveRequests.Count) leave requests" -ForegroundColor Green
    
    if ($leaveRequests.Count -eq 0) {
        Write-Host "No leave requests found. Please create some leave requests first." -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "Error fetching leave requests: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Get the first leave request
$firstRequest = $leaveRequests[0]
Write-Host ""
Write-Host "2. Testing with leave request ID: $($firstRequest._id)" -ForegroundColor Yellow
Write-Host "   Employee: $($firstRequest.employeeName) ($($firstRequest.employeeId))" -ForegroundColor White
Write-Host "   Current Status: $($firstRequest.status)" -ForegroundColor White
Write-Host "   Leave Type: $($firstRequest.leaveType)" -ForegroundColor White

# Step 3: Update the status to Approved
Write-Host ""
Write-Host "3. Updating status to 'Approved'..." -ForegroundColor Yellow
try {
    $updateBody = @{
        status = "Approved"
        adminNotes = "Test approval from PowerShell script"
    } | ConvertTo-Json

    $updateResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/leave/$($firstRequest._id)/status" -Method PATCH -Headers @{"Content-Type"="application/json"} -Body $updateBody
    
    if ($updateResponse.StatusCode -eq 200) {
        $updatedRequest = $updateResponse.Content | ConvertFrom-Json
        Write-Host "Status update successful!" -ForegroundColor Green
        Write-Host "   New Status: $($updatedRequest.status)" -ForegroundColor White
        Write-Host "   Admin Notes: $($updatedRequest.adminNotes)" -ForegroundColor White
    } else {
        Write-Host "Status update failed: $($updateResponse.StatusCode)" -ForegroundColor Red
        Write-Host "   Error: $($updateResponse.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error updating status: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Verify the update by fetching again
Write-Host ""
Write-Host "4. Verifying the update..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/leave/admin" -Method GET
    $updatedRequests = $verifyResponse.Content | ConvertFrom-Json
    $updatedRequest = $updatedRequests | Where-Object { $_.id -eq $firstRequest._id }
    
    if ($updatedRequest -and $updatedRequest.status -eq "Approved") {
        Write-Host "Verification successful! Status is now 'Approved'" -ForegroundColor Green
    } else {
        Write-Host "Verification failed! Status was not updated properly" -ForegroundColor Red
    }
} catch {
    Write-Host "Error verifying update: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test employee-specific leave requests
Write-Host ""
Write-Host "5. Testing employee-specific leave requests..." -ForegroundColor Yellow
try {
    $employeeResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/leave/employee/$($firstRequest.employeeId)" -Method GET
    $employeeRequests = $employeeResponse.Content | ConvertFrom-Json
    Write-Host "Found $($employeeRequests.Count) leave requests for employee $($firstRequest.employeeName)" -ForegroundColor Green
    
    $employeeRequest = $employeeRequests | Where-Object { $_.id -eq $firstRequest._id }
    if ($employeeRequest) {
        Write-Host "   Employee can see their request with status: $($employeeRequest.status)" -ForegroundColor White
    } else {
        Write-Host "Employee cannot see their updated request" -ForegroundColor Red
    }
} catch {
    Write-Host "Error testing employee requests: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Leave status update test completed!" -ForegroundColor Cyan
