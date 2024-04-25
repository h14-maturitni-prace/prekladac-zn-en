class CircuitBreaker {
    constructor(request, options = {}) {
        this.request = request;
        this.state = "CLOSED";
        this.failureThreshold = options.failureThreshold || 5;
        this.timeout = options.timeout || 60000; // 60 seconds
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.estimatedOpenTime = 0; // New property to manage RATE_LIMITED state
    }

    async callService(requestOptions) {
        if (this.state === "OPEN" || this.state === "RATE_LIMITED") {
            const now = Date.now();
            if (this.nextAttempt <= now) {
                if (this.state === "RATE_LIMITED") {
                    // If RATE_LIMITED, delay until the estimatedOpenTime
                    const delay = this.estimatedOpenTime - now;
                    if (delay > 0) {
                        console.log(`Delaying request for ${delay}ms due to RATE_LIMITED state.`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                }
                this.state = "HALF-OPEN";
                console.log("Circuit breaker state changed to HALF-OPEN.");
            } else {
                console.error("Circuit breaker is OPEN or RATE_LIMITED. All requests are blocked.");
                throw new Error("Circuit breaker is OPEN or RATE_LIMITED. All requests are blocked.");
            }
        }

        try {
            const response = await this.request(requestOptions);
            this.successCount++;
            if (this.state === "HALF-OPEN" && this.successCount > this.failureThreshold) {
                this.state = "CLOSED";
                this.successCount = 0;
                console.log("Circuit breaker is now CLOSED.");
            }
            this.failureCount = 0;
            return response;
        } catch (error) {
            console.error("Error during service call:", error.message);
            console.error(error.stack);
            this.failureCount++;
            if (error.response && error.response.status === 429) {
                this.state = "RATE_LIMITED";
                const retryAfter = error.response.headers['retry-after'];
                this.estimatedOpenTime = Date.now() + (retryAfter ? parseInt(retryAfter) * 1000 : this.timeout);
                console.log(`Circuit breaker is now RATE_LIMITED. Next attempt after ${this.estimatedOpenTime - Date.now()} milliseconds.`);
            } else if (this.failureCount >= this.failureThreshold) {
                this.state = "OPEN";
                this.nextAttempt = Date.now() + this.timeout;
                console.log(`Circuit breaker is now OPEN. Next attempt after ${this.timeout} milliseconds.`);
                setTimeout(() => {
                    this.state = "HALF-OPEN";
                    console.log("Circuit breaker state reset to HALF-OPEN after timeout.");
                }, this.timeout);
            }
            throw error;
        }
    }
}

module.exports = CircuitBreaker;