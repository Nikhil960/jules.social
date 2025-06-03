import { InstagramIntegration } from "./instagram"
import { XIntegration } from "./x"
import { LinkedInIntegration } from "./linkedin"
import { YouTubeIntegration } from "./youtube"

export interface SocialPlatformIntegration {
  connectAccount(authCode: string, userId: number): Promise<any>
  publishPost(accountData: any, postData: any): Promise<any>
  getAccountMetrics(accountData: any): Promise<any>
  getPostMetrics(accountData: any, postId: string): Promise<any>
  refreshToken(accountData: any): Promise<any>
  validateConnection(accountData: any): Promise<boolean>
}

export class PlatformFactory {
  private static integrations: Map<string, SocialPlatformIntegration> = new Map([
    ["instagram", new InstagramIntegration()],
    ["x", new XIntegration()],
    ["linkedin", new LinkedInIntegration()],
    ["youtube", new YouTubeIntegration()],
  ])

  static getIntegration(platform: string): SocialPlatformIntegration {
    const integration = this.integrations.get(platform.toLowerCase())
    if (!integration) {
      throw new Error(`Unsupported platform: ${platform}`)
    }
    return integration
  }

  static getSupportedPlatforms(): string[] {
    return Array.from(this.integrations.keys())
  }

  static async publishToAllPlatforms(
    platforms: string[],
    accountsData: any[],
    postData: any,
  ): Promise<Array<{ platform: string; success: boolean; result?: any; error?: string }>> {
    const results = []

    for (const platform of platforms) {
      try {
        const integration = this.getIntegration(platform)
        const accountData = accountsData.find((acc) => acc.platform === platform)

        if (!accountData) {
          results.push({
            platform,
            success: false,
            error: `No connected account found for ${platform}`,
          })
          continue
        }

        const result = await integration.publishPost(accountData, postData)
        results.push({
          platform,
          success: true,
          result,
        })
      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return results
  }

  static async refreshAllTokens(accountsData: any[]): Promise<void> {
    const refreshPromises = accountsData.map(async (accountData) => {
      try {
        const integration = this.getIntegration(accountData.platform)
        await integration.refreshToken(accountData)
      } catch (error) {
        console.error(`Failed to refresh token for ${accountData.platform}:`, error)
      }
    })

    await Promise.allSettled(refreshPromises)
  }

  static async validateAllConnections(
    accountsData: any[],
  ): Promise<Array<{ accountId: number; platform: string; isValid: boolean }>> {
    const validationPromises = accountsData.map(async (accountData) => {
      try {
        const integration = this.getIntegration(accountData.platform)
        const isValid = await integration.validateConnection(accountData)
        return {
          accountId: accountData.id,
          platform: accountData.platform,
          isValid,
        }
      } catch (error) {
        return {
          accountId: accountData.id,
          platform: accountData.platform,
          isValid: false,
        }
      }
    })

    return Promise.all(validationPromises)
  }
}
